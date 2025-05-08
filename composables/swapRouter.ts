import type { Hash, Hex } from 'viem'
import { encodeFunctionData, encodePacked, toHex } from 'viem'
import type { BigintIsh, Currency, Percent, Token } from '@wicchain/sdk'
import { CurrencyAmount, TradeType, validateAndParseAddress } from '@wicchain/sdk'

import invariant from 'tiny-invariant'
import swapRouterABI from '~/constant/abi/swapRouter.json'
import ABI_Multicall from '~/constant/abi/multicall.json'
import { Payments, SelfPermit, type MethodParameters, type PermitOptions } from '@wicchain/v3-sdk'
import type { V3Pool } from '@wicchain/smart-router'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Multicall {
  public static ABI = ABI_Multicall

  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static encodeMulticall(calldatas: `0x${string}` | `0x${string}`[]): `0x${string}` {
    if (!Array.isArray(calldatas)) {
      calldatas = [calldatas]
    }

    return calldatas.length === 1 ? calldatas[0] : encodeFunctionData({ abi: Multicall.ABI, functionName: 'multicall', args: [calldatas] })
  }
}

/**
 * Options for producing the arguments to send calls to the router.
 */
export interface SwapOptions {
  /**
   * How much the execution price is allowed to move unfavorably from the trade execution price.
   */
  slippageTolerance: Percent

  /**
   * The account that should receive the output.
   */
  recipient: string

  /**
   * When the transaction expires, in epoch seconds.
   */
  deadline: BigintIsh

  /**
   * The optional permit parameters for spending the input.
   */
  inputTokenPermit?: PermitOptions

  /**
   * The optional price limit for the trade.
   */
  sqrtPriceLimitX96?: BigintIsh

  /**
   * Optional information for taking a fee on output.
   */
  fee?: FeeOptions
}

/**
 * Represents the Pancake V3 SwapRouter, and has static methods for helping execute trades.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class SwapRouter {
  // public static INTERFACE: Interface = new Interface(ISwapRouter)
  public static ABI = swapRouterABI

  /**
   * Cannot be constructed.
   */
  private constructor() {}

  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trade to produce call parameters for
   * @param options options for the call parameters
   */
  public static swapCallParameters(
    trades: Trade<Currency, Currency, TradeType> | Trade<Currency, Currency, TradeType>[],
    options: SwapOptions
  ): MethodParameters {
    if (!Array.isArray(trades)) {
      trades = [trades]
    }

    const sampleTrade = trades[0]
    const tokenIn = sampleTrade.inputAmount.currency.wrapped
    const tokenOut = sampleTrade.outputAmount.currency.wrapped

    // All trades should have the same starting and ending token.
    invariant(
      trades.every((trade) => trade.inputAmount.currency.wrapped.equals(tokenIn)),
      'TOKEN_IN_DIFF'
    )
    invariant(
      trades.every((trade) => trade.outputAmount.currency.wrapped.equals(tokenOut)),
      'TOKEN_OUT_DIFF'
    )

    const calldatas: Hex[] = []

    const ZERO_IN: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(trades[0].inputAmount.currency, 0)
    const ZERO_OUT: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(trades[0].outputAmount.currency, 0)

    const totalAmountOut: CurrencyAmount<Currency> = trades.reduce((sum, trade) => sum.add(trade.minimumAmountOut(options.slippageTolerance)), ZERO_OUT)

    // flag for whether a refund needs to happen
    const mustRefund = sampleTrade.inputAmount.currency.isNative && sampleTrade.tradeType === TradeType.EXACT_OUTPUT
    const inputIsNative = sampleTrade.inputAmount.currency.isNative
    // flags for whether funds should be send first to the router
    const outputIsNative = sampleTrade.outputAmount.currency.isNative
    const routerMustCustody = outputIsNative || !!options.fee

    const totalValue: CurrencyAmount<Currency> = inputIsNative
      ? trades.reduce((sum, trade) => sum.add(trade.maximumAmountIn(options.slippageTolerance)), ZERO_IN)
      : ZERO_IN

    // encode permit if necessary
    if (options.inputTokenPermit) {
      invariant(sampleTrade.inputAmount.currency.isToken, 'NON_TOKEN_PERMIT')
      calldatas.push(SelfPermit.encodePermit(sampleTrade.inputAmount.currency, options.inputTokenPermit))
    }

    const recipient = validateAndParseAddress(options.recipient)
    const deadline = BigInt(options.deadline)

    for (const trade of trades) {
      for (const { route, inputAmount, outputAmount } of trade.swaps) {
        const amountIn = BigInt(trade.maximumAmountIn(options.slippageTolerance, inputAmount).quotient)
        const amountOut = BigInt(trade.minimumAmountOut(options.slippageTolerance, outputAmount).quotient)

        // flag for whether the trade is single hop or not
        const singleHop = route.pools.length === 1

        if (singleHop) {
          if (trade.tradeType === TradeType.EXACT_INPUT) {
            const exactInputSingleParams = {
              tokenIn: route.tokenPath[0].wrapped.address,
              tokenOut: route.tokenPath[1].wrapped.address,
              fee: route.pools[0].fee,
              recipient: routerMustCustody ? ADDRESS_ZERO : recipient,
              deadline,
              amountIn,
              amountOutMinimum: amountOut,
              sqrtPriceLimitX96: BigInt(options.sqrtPriceLimitX96 ?? 0)
            }
            calldatas.push(
              encodeFunctionData({
                abi: SwapRouter.ABI,
                functionName: 'exactInputSingle',
                args: [exactInputSingleParams]
              })
            )
          } else {
            const exactOutputSingleParams = {
              tokenIn: route.tokenPath[0].wrapped.address,
              tokenOut: route.tokenPath[1].wrapped.address,
              fee: route.pools[0].fee,
              recipient: routerMustCustody ? ADDRESS_ZERO : recipient,
              deadline,
              amountOut,
              amountInMaximum: amountIn,
              sqrtPriceLimitX96: BigInt(options.sqrtPriceLimitX96 ?? 0)
            }

            calldatas.push(
              encodeFunctionData({
                abi: SwapRouter.ABI,
                functionName: 'exactOutputSingle',
                args: [exactOutputSingleParams]
              })
            )
          }
        } else {
          invariant(options.sqrtPriceLimitX96 === undefined, 'MULTIHOP_PRICE_LIMIT')

          const path = encodeRouteToPath(route, trade.tradeType === TradeType.EXACT_OUTPUT)

          if (trade.tradeType === TradeType.EXACT_INPUT) {
            const exactInputParams = {
              path,
              recipient: routerMustCustody ? ADDRESS_ZERO : recipient,
              deadline,
              amountIn,
              amountOutMinimum: amountOut
            }

            calldatas.push(encodeFunctionData({ abi: SwapRouter.ABI, functionName: 'exactInput', args: [exactInputParams] }))
          } else {
            const exactOutputParams = {
              path,
              recipient: routerMustCustody ? ADDRESS_ZERO : recipient,
              deadline,
              amountOut,
              amountInMaximum: amountIn
            }

            calldatas.push(encodeFunctionData({ abi: SwapRouter.ABI, functionName: 'exactOutput', args: [exactOutputParams] }))
          }
        }
      }
    }

    // unwrap
    if (routerMustCustody) {
      if (options.fee) {
        if (outputIsNative) {
          calldatas.push(Payments.encodeUnwrapWETH9(totalAmountOut.quotient, recipient, options.fee))
        } else {
          calldatas.push(Payments.encodeSweepToken(sampleTrade.outputAmount.currency.wrapped, totalAmountOut.quotient, recipient, options.fee))
        }
      } else {
        calldatas.push(Payments.encodeUnwrapWETH9(totalAmountOut.quotient, recipient))
      }
    }

    // refund
    if (mustRefund) {
      calldatas.push(Payments.encodeRefundETH())
    }

    return {
      calldata: Multicall.encodeMulticall(calldatas),
      value: toHex(totalValue.quotient)
    }
  }
}

/**
 * Converts a route to a hex encoded path
 * @param route the v3 path to convert to an encoded path
 * @param exactOutput whether the route should be encoded in reverse, for making exact output swaps
 */
export function encodeRouteToPath(route: RouteV3<Currency, Currency>, exactOutput: boolean): Hash {
  const firstInputToken: Token = route.input.wrapped

  const { path, types } = route.pools.reduce(
    (
      { inputToken, path, types }: { inputToken: Token; path: (string | number)[]; types: string[] },
      pool: V3Pool,
      index
    ): { inputToken: Token; path: (string | number)[]; types: string[] } => {
      const outputToken: Token = pool.token0.equals(inputToken) ? pool.token1.wrapped : pool.token0.wrapped
      if (index === 0) {
        return {
          inputToken: outputToken,
          types: ['address', 'uint24', 'address'],
          path: [inputToken.address, pool.fee, outputToken.address]
        }
      }
      return {
        inputToken: outputToken,
        types: [...types, 'uint24', 'address'],
        path: [...path, pool.fee, outputToken.address]
      }
    },
    { inputToken: firstInputToken, path: [], types: [] }
  )

  return exactOutput ? encodePacked(types.reverse(), path.reverse()) : encodePacked(types, path)
}
