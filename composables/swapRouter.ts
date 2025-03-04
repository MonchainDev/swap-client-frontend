// import { encodeFunctionData, type Hex, type Address } from 'viem'
// import { type Currency, CurrencyAmount, Percent, TradeType, validateAndParseAddress, WNATIVE } from '@monchain/sdk'
// import { ChainId } from '@monchain/chains'
// import { type FeeOptions, type MethodParameters, Payments, type PermitOptions, Position, SelfPermit, toHex, } from '@monchain/v3-sdk'
// import invariant from 'tiny-invariant'
// import SMART_ROUTER_ABI from '~/constant/abi/swapRouter.json'
//
//
// import {
//   type Pool,
//   PoolType,
//   type QuoteProvider,
//   type QuoterConfig,
//   RouteType,
//   SmartRouter,
//   type SmartRouterTrade,
//   type V3Pool,
// } from '@monchain/smart-router/evm'
//
// import { Fraction, ONE } from '@monchain/sdk'
//
// import { type BigintIsh } from '@monchain/sdk'
// // import {encodeMixedRouteToPath} from "@monchain/smart-router/dist/evm/v3-router/utils";
//
// export type Validation = BigintIsh | string
//
// const ZERO = 0n
// const REFUND_ETH_PRICE_IMPACT_THRESHOLD = new Percent(50n, 100n)
//
// export const MSG_SENDER = '0x0000000000000000000000000000000000000001'
// export const ADDRESS_THIS = '0x0000000000000000000000000000000000000002'
//
// /**
//  * Options for producing the arguments to send calls to the router.
//  */
// export interface SwapOptions {
//   /**
//    * How much the execution price is allowed to move unfavorably from the trade execution price.
//    */
//   slippageTolerance: Percent
//
//   /**
//    * The account that should receive the output. If omitted, output is sent to msg.sender.
//    */
//   recipient?: Address
//
//   /**
//    * Either deadline (when the transaction expires, in epoch seconds), or previousBlockhash.
//    */
//   deadlineOrPreviousBlockhash?: Validation
//
//   /**
//    * The optional permit parameters for spending the input.
//    */
//   inputTokenPermit?: PermitOptions
//
//   /**
//    * Optional information for taking a fee on output.
//    */
//   fee?: FeeOptions
// }
//
// export interface SwapAndAddOptions extends SwapOptions {
//   /**
//    * The optional permit parameters for pulling in remaining output token.
//    */
//   outputTokenPermit?: PermitOptions
// }
//
// type AnyTradeType = SmartRouterTrade<TradeType> | SmartRouterTrade<TradeType>[]
//
//
// export function maximumAmountIn(
//     trade: Pick<SmartRouterTrade<TradeType>, 'inputAmount' | 'tradeType'>,
//     slippage: Percent,
//     amountIn = trade.inputAmount,
// ) {
//   if (trade.tradeType === TradeType.EXACT_INPUT) {
//     return amountIn
//   }
//
//   const slippageAdjustedAmountIn = new Fraction(ONE).add(slippage).multiply(amountIn.quotient).quotient
//   return CurrencyAmount.fromRawAmount(amountIn.currency, slippageAdjustedAmountIn)
// }
//
// export function minimumAmountOut(
//     trade: Pick<SmartRouterTrade<TradeType>, 'outputAmount' | 'tradeType'>,
//     slippage: Percent,
//     amountOut = trade.outputAmount,
// ) {
//   if (trade.tradeType === TradeType.EXACT_OUTPUT) {
//     return amountOut
//   }
//   const slippageAdjustedAmountOut = new Fraction(ONE).add(slippage).invert().multiply(amountOut.quotient).quotient
//   return CurrencyAmount.fromRawAmount(amountOut.currency, slippageAdjustedAmountOut)
// }
//
// /**
//  * Represents the Pancakeswap V2 + V3 + StableSwap SwapRouter02, and has static methods for helping execute trades.
//  */
// export abstract class SwapRouter {
//   public static ABI = swapRouter02Abi
//
//   /**
//    * Cannot be constructed.
//    */
//   // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
//   private constructor() {}
//
//   /**
//    * @notice Generates the calldata for a Swap with a V3 Route.
//    * @param trade The V3Trade to encode.
//    * @param options SwapOptions to use for the trade.
//    * @param routerMustCustody Flag for whether funds should be sent to the router
//    * @param performAggregatedSlippageCheck Flag for whether we want to perform an aggregated slippage check
//    * @returns A string array of calldatas for the trade.
//    */
//   private static encodeV3Swap(
//     trade: SmartRouterTrade<TradeType>,
//     options: SwapOptions,
//     routerMustCustody: boolean,
//     performAggregatedSlippageCheck: boolean,
//   ): Hex[] {
//     const calldatas: Hex[] = []
//
//     for (const route of trade.routes) {
//       const { inputAmount, outputAmount, pools, path } = route
//       const amountIn: bigint = maximumAmountIn(trade, options.slippageTolerance, inputAmount).quotient
//       const amountOut: bigint = minimumAmountOut(trade, options.slippageTolerance, outputAmount).quotient
//
//       // flag for whether the trade is single hop or not
//       const singleHop = pools.length === 1
//
//       const recipient = routerMustCustody
//         ? ADDRESS_THIS
//         : typeof options.recipient === 'undefined'
//         ? MSG_SENDER
//         : validateAndParseAddress(options.recipient)
//
//       if (singleHop) {
//         if (trade.tradeType === TradeType.EXACT_INPUT) {
//           const exactInputSingleParams = {
//             tokenIn: path[0].wrapped.address,
//             tokenOut: path[1].wrapped.address,
//             fee: (pools[0] as V3Pool).fee,
//             recipient,
//             amountIn,
//             amountOutMinimum: performAggregatedSlippageCheck ? 0n : amountOut,
//             sqrtPriceLimitX96: 0n,
//           }
//
//           calldatas.push(
//             encodeFunctionData({
//               abi: SwapRouter.ABI,
//               functionName: 'exactInputSingle',
//               args: [exactInputSingleParams],
//             }),
//           )
//         } else {
//           const exactOutputSingleParams = {
//             tokenIn: path[0].wrapped.address,
//             tokenOut: path[1].wrapped.address,
//             fee: (pools[0] as V3Pool).fee,
//             recipient,
//             amountOut,
//             amountInMaximum: amountIn,
//             sqrtPriceLimitX96: 0n,
//           }
//
//           calldatas.push(
//             encodeFunctionData({
//               abi: SwapRouter.ABI,
//               functionName: 'exactOutputSingle',
//               args: [exactOutputSingleParams],
//             }),
//           )
//         }
//       } else {
//         const pathStr = encodeMixedRouteToPath(
//           { ...route, input: inputAmount.currency, output: outputAmount.currency },
//           trade.tradeType === TradeType.EXACT_OUTPUT,
//         )
//
//         if (trade.tradeType === TradeType.EXACT_INPUT) {
//           const exactInputParams = {
//             path: pathStr,
//             recipient,
//             amountIn,
//             amountOutMinimum: performAggregatedSlippageCheck ? 0n : amountOut,
//           }
//
//           calldatas.push(
//             encodeFunctionData({
//               abi: SwapRouter.ABI,
//               functionName: 'exactInput',
//               args: [exactInputParams],
//             }),
//           )
//         } else {
//           const exactOutputParams = {
//             path: pathStr,
//             recipient,
//             amountOut,
//             amountInMaximum: amountIn,
//           }
//
//           calldatas.push(
//             encodeFunctionData({
//               abi: SwapRouter.ABI,
//               functionName: 'exactOutput',
//               args: [exactOutputParams],
//             }),
//           )
//         }
//       }
//     }
//
//     return calldatas
//   }
//
//   /**
//    * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
//    * @param trades to produce call parameters for
//    * @param options options for the call parameters
//    */
//   public static swapCallParameters(trades: AnyTradeType, options: SwapOptions): MethodParameters {
//     const {
//       calldatas,
//       sampleTrade,
//       routerMustCustody,
//       inputIsNative,
//       outputIsNative,
//       totalAmountIn,
//       minimumAmountOut: minAmountOut,
//     } = SwapRouter.encodeSwaps(trades, options)
//
//     // unwrap or sweep
//     if (routerMustCustody) {
//       if (outputIsNative) {
//         calldatas.push(PaymentsExtended.encodeUnwrapWETH9(minAmountOut.quotient, options.recipient, options.fee))
//       } else {
//         calldatas.push(
//           PaymentsExtended.encodeSweepToken(
//             sampleTrade.outputAmount.currency.wrapped,
//             minAmountOut.quotient,
//             options.recipient,
//             options.fee,
//           ),
//         )
//       }
//     }
//
//     // must refund when paying in ETH: either with an uncertain input amount OR if there's a chance of a partial fill.
//     // unlike ERC20's, the full ETH value must be sent in the transaction, so the rest must be refunded.
//     if (inputIsNative && (sampleTrade.tradeType === TradeType.EXACT_OUTPUT || SwapRouter.riskOfPartialFill(trades))) {
//       calldatas.push(Payments.encodeRefundETH())
//     }
//
//     return {
//       calldata: MulticallExtended.encodeMulticall(calldatas, options.deadlineOrPreviousBlockhash),
//       value: toHex(inputIsNative ? totalAmountIn.quotient : ZERO),
//     }
//   }
//
//   /**
//    * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
//    * @param trades to produce call parameters for
//    * @param options options for the call parameters
//    */
//   public static swapAndAddCallParameters(
//     trades: AnyTradeType,
//     options: SwapAndAddOptions,
//     position: Position,
//     addLiquidityOptions: CondensedAddLiquidityOptions,
//     tokenInApprovalType: ApprovalTypes,
//     tokenOutApprovalType: ApprovalTypes,
//   ): MethodParameters {
//     const {
//       calldatas,
//       inputIsNative,
//       outputIsNative,
//       sampleTrade,
//       totalAmountIn: totalAmountSwapped,
//       quoteAmountOut,
//       minimumAmountOut: minAmountOut,
//     } = SwapRouter.encodeSwaps(trades, options, true)
//
//     // encode output token permit if necessary
//     if (options.outputTokenPermit) {
//       invariant(quoteAmountOut.currency.isToken, 'NON_TOKEN_PERMIT_OUTPUT')
//       calldatas.push(SelfPermit.encodePermit(quoteAmountOut.currency, options.outputTokenPermit))
//     }
//
//     const {
//       inputAmount: {
//         currency: { chainId },
//       },
//     } = sampleTrade
//     const zeroForOne = position.pool.token0.wrapped.address === totalAmountSwapped.currency.wrapped.address
//     const { positionAmountIn, positionAmountOut } = SwapRouter.getPositionAmounts(position, zeroForOne)
//
//     // if tokens are native they will be converted to WETH9
//     const tokenIn = inputIsNative ? WNATIVE[chainId as ChainId] : positionAmountIn.currency.wrapped
//     const tokenOut = outputIsNative ? WNATIVE[chainId as ChainId] : positionAmountOut.currency.wrapped
//
//     // if swap output does not make up whole outputTokenBalanceDesired, pull in remaining tokens for adding liquidity
//     const amountOutRemaining = positionAmountOut.subtract(quoteAmountOut.wrapped)
//     if (amountOutRemaining.greaterThan(CurrencyAmount.fromRawAmount(positionAmountOut.currency, 0))) {
//       // if output is native, this means the remaining portion is included as native value in the transaction
//       // and must be wrapped. Otherwise, pull in remaining ERC20 token.
//       if (outputIsNative) {
//         calldatas.push(PaymentsExtended.encodeWrapETH(amountOutRemaining.quotient))
//       } else {
//         calldatas.push(PaymentsExtended.encodePull(tokenOut, amountOutRemaining.quotient))
//       }
//     }
//
//     // if input is native, convert to WETH9, else pull ERC20 token
//     if (inputIsNative) {
//       calldatas.push(PaymentsExtended.encodeWrapETH(positionAmountIn.quotient))
//     } else {
//       calldatas.push(PaymentsExtended.encodePull(tokenIn, positionAmountIn.quotient))
//     }
//
//     // approve token balances to NFTManager
//     if (tokenInApprovalType !== ApprovalTypes.NOT_REQUIRED)
//       calldatas.push(ApproveAndCall.encodeApprove(tokenIn, tokenInApprovalType))
//     if (tokenOutApprovalType !== ApprovalTypes.NOT_REQUIRED)
//       calldatas.push(ApproveAndCall.encodeApprove(tokenOut, tokenOutApprovalType))
//
//     // represents a position with token amounts resulting from a swap with maximum slippage
//     // hence the minimal amount out possible.
//     const minimalPosition = Position.fromAmounts({
//       pool: position.pool,
//       tickLower: position.tickLower,
//       tickUpper: position.tickUpper,
//       amount0: zeroForOne ? position.amount0.quotient.toString() : minAmountOut.quotient.toString(),
//       amount1: zeroForOne ? minAmountOut.quotient.toString() : position.amount1.quotient.toString(),
//       useFullPrecision: false,
//     })
//
//     // encode NFTManager add liquidity
//     calldatas.push(
//       ApproveAndCall.encodeAddLiquidity(position, minimalPosition, addLiquidityOptions, options.slippageTolerance),
//     )
//
//     // sweep remaining tokens
//     if (inputIsNative) {
//       calldatas.push(PaymentsExtended.encodeUnwrapWETH9(ZERO))
//     } else {
//       calldatas.push(PaymentsExtended.encodeSweepToken(tokenIn, ZERO))
//     }
//     if (outputIsNative) {
//       calldatas.push(PaymentsExtended.encodeUnwrapWETH9(ZERO))
//     } else {
//       calldatas.push(PaymentsExtended.encodeSweepToken(tokenOut, ZERO))
//     }
//
//     let value: bigint
//     if (inputIsNative) {
//       value = totalAmountSwapped.wrapped.add(positionAmountIn.wrapped).quotient
//     } else if (outputIsNative) {
//       value = amountOutRemaining.quotient
//     } else {
//       value = ZERO
//     }
//
//     return {
//       calldata: MulticallExtended.encodeMulticall(calldatas, options.deadlineOrPreviousBlockhash),
//       value: toHex(value.toString()),
//     }
//   }
//
//   // if price impact is very high, there's a chance of hitting max/min prices resulting in a partial fill of the swap
//   public static riskOfPartialFill(trades: AnyTradeType): boolean {
//     if (Array.isArray(trades)) {
//       return trades.some((trade) => {
//         return SwapRouter.v3TradeWithHighPriceImpact(trade)
//       })
//     }
//     return SwapRouter.v3TradeWithHighPriceImpact(trades)
//   }
//
//   private static v3TradeWithHighPriceImpact(trade: SmartRouterTrade<TradeType>): boolean {
//     return (
//       !(trade.routes.length === 1 && trade.routes[0].type === RouteType.V2) &&
//       getPriceImpact(trade).greaterThan(REFUND_ETH_PRICE_IMPACT_THRESHOLD)
//     )
//   }
//
//   private static getPositionAmounts(
//     position: Position,
//     zeroForOne: boolean,
//   ): {
//     positionAmountIn: CurrencyAmount<Currency>
//     positionAmountOut: CurrencyAmount<Currency>
//   } {
//     const { amount0, amount1 } = position.mintAmounts
//     const currencyAmount0 = CurrencyAmount.fromRawAmount(position.pool.token0, amount0)
//     const currencyAmount1 = CurrencyAmount.fromRawAmount(position.pool.token1, amount1)
//
//     const [positionAmountIn, positionAmountOut] = zeroForOne
//       ? [currencyAmount0, currencyAmount1]
//       : [currencyAmount1, currencyAmount0]
//     return { positionAmountIn, positionAmountOut }
//   }
// }
