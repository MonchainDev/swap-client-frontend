import ABI_MON_FACTORY from '@/constant/abi/MonFactory.json'
import ABI_ERC20 from '@/constant/abi/token.json'
import { Percent } from '@monchain/sdk'
import { PoolType, type Route, type SmartRouterTrade, type V3Pool } from '@monchain/smart-router'
import { CurrencyAmount, Token, TradeType, type Currency } from '@monchain/swap-sdk-core'
import { TICK_SPACINGS, TickMath, type FeeAmount } from '@monchain/v3-sdk'
import { readContract } from '@wagmi/core'
import { Decimal } from 'decimal.js'
import invariant from 'tiny-invariant'
import { createPublicClient, http, type Address } from 'viem'
import { useGetPoolLiquidity, useGetPoolSlot } from '~/composables/usePool'
import { useGetTokenInfo } from '~/composables/useToken'
import { config } from '~/config/wagmi'
import { ChainId } from '~/types'
import { FEE_ALLOWANCE } from '~/utils/constanst'
import { monTestnet } from './config/chains'

// TODO: thay chain theo network
const publicClient = createPublicClient({
  chain: monTestnet,
  transport: http('https://rpc-testnet.monchain.info'),
  batch: {
    multicall: {
      batchSize: 1024 * 200
    }
  }
})

interface SwapInput {
  token0: string
  token1: string
  inputAmount: number
  type: TradeType
  chainId?: number
}

export interface SwapOutput extends SmartRouterTrade<TradeType> {
  tradingFee: number
  fee: number
  priceImpact: Percent
  slippage: Percent
  minimumAmountOut?: CurrencyAmount<Currency>
  maximumAmountIn?: CurrencyAmount<Currency>
}

const BASE_FEE_PERCENT = 10 ** 6

export const getBestTrade = async ({ token0, token1, inputAmount, type, chainId }: SwapInput): Promise<SwapOutput> => {
  try {
    const listPool: V3Pool[] = []
    const token0Info = await useGetTokenInfo(token0)
    const token1Info = await useGetTokenInfo(token1)
    const token0Currency = new Token(token0Info.chainId, token0 as `0x${string}`, token0Info.decimals, token0Info.symbol)
    const token1Currency = new Token(token1Info.chainId, token1 as `0x${string}`, token1Info.decimals, token1Info.symbol)
    const balances: { [key: string]: { [key: string]: bigint } } = {}

    const factoryContract = getFactoryAddress(chainId ?? ChainId.MON_TESTNET)

    let totalOutputMaximum = CurrencyAmount.fromRawAmount(token1Currency, 0n)
    for (const fee of FEE_ALLOWANCE) {
      const pool = (await readContract(config, {
        abi: ABI_MON_FACTORY,
        address: factoryContract!,
        functionName: 'getPool',
        args: [token0 as `$0x${string}` as Address, token1 as `$0x${string}` as Address, fee]
      })) as string
      // // // console.info('🚀 ~ getBestTrade ~ pool:', pool)
      if (pool === '0x0000000000000000000000000000000000000000') {
        continue
      }
      const liquidity = await useGetPoolLiquidity(pool)
      if (liquidity === 0n) {
        console.info(`🚀 pool ${pool} not enough liquidity`, liquidity)
        continue
      }

      const slot0 = await useGetPoolSlot(pool)
      const balanceToken0 = (await readContract(config, {
        abi: ABI_ERC20,
        address: token0 as `0x${string}`,
        functionName: 'balanceOf',
        args: [pool as `$0x${string}` as Address]
      })) as bigint

      const balanceToken1 = (await readContract(config, {
        abi: ABI_ERC20,
        address: token1 as `0x${string}`,
        functionName: 'balanceOf',
        args: [pool as `$0x${string}` as Address]
      })) as bigint

      totalOutputMaximum = totalOutputMaximum.add(CurrencyAmount.fromRawAmount(token1Currency, balanceToken1))

      if (!balances[token0]) balances[token0] = {}
      if (!balances[token1]) balances[token1] = {}

      balances[token0][pool] = balanceToken0
      balances[token1][pool] = balanceToken1

      const v3Pool = makeV3Pool(token0Currency, token1Currency, liquidity, fee, slot0.sqrtPriceX96, slot0.feeProtocol, pool as `0x${string}`)
      listPool.push(v3Pool)
    }

    // TODO:
    if (listPool.length === 0) {
      throw new Error('No pool found')
    }

    let tradingFee = 0
    const routeOuts: Route[] = []
    const newTradeList: Trade<Currency, Token, TradeType>[] = []

    const { slippage } = storeToRefs(useSwapStore())
    const slippageValue = Number(slippage.value)

    const gasEstimate = await publicClient.getGasPrice()

    const slippagePercent = new Percent(Number(slippage.value))

    let priceImpact: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token1Currency, 0)

    // const zeroToOne = token0Currency.sortsBefore(token1Currency)

    if (type === TradeType.EXACT_INPUT) {
      const currencyAmount = CurrencyAmount.fromRawAmount(token0Currency, inputAmount)
      const bestTrades = await Trade.bestTradeExactIn(listPool, currencyAmount, token1Currency)

      let remainAmountIn = currencyAmount
      let totalOutputA: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token1Currency, 0n)
      let spotOutputAmount: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token1Currency, 0)

      for (let i = 0; i < bestTrades.length; i++) {
        const bestTrade = bestTrades[i]
        const pool = bestTrade.swaps[0].route.pools[0]
        const liquidity = pool.liquidity

        const balanceToken0 = Math.floor(Number(balances[token0][bestTrade.swaps[0].route.pools[0].address]))

        // Tính số token output trước khi swap với giá hiện tại
        const currentPrice = new Decimal(pool.sqrtRatioX96.toString()).div(2 ** 96).pow(2)
        const minPrice = currentPrice.mul(1 - slippageValue / 100)
        const _maxInputLiquidity = Math.floor(Number(liquidity) * (1 / minPrice.sqrt().toNumber() - 1 / currentPrice.sqrt().toNumber()))
        const maxInputForPool = balanceToken0

        const fee = bestTrade.swaps[0].route.pools[0].fee
        console.info(bestTrade.swaps[0].route.pools[0].address, fee.toString())

        const balance1 = Math.floor(Number(balances[token1][bestTrade.swaps[0].route.pools[0].address]))
        const maxInput = CurrencyAmount.fromRawAmount(token0Currency, maxInputForPool)

        let recalInputAmount = remainAmountIn
        if (remainAmountIn.greaterThan(maxInput)) {
          recalInputAmount = maxInput
        }
        const bestTradeInAmount = await Trade.bestTradeExactIn(bestTrade.swaps[0].route.pools, recalInputAmount, token1Currency)

        if (bestTradeInAmount[0].outputAmount.greaterThan(balance1)) {
          continue
        }

        totalOutputA = totalOutputA.add(bestTradeInAmount[0].outputAmount)
        newTradeList.push(...bestTradeInAmount)
        remainAmountIn = remainAmountIn.subtract(recalInputAmount)

        tradingFee += (Number(fee.toString()) / BASE_FEE_PERCENT) * Number(recalInputAmount.numerator)
        const percent = (Number(recalInputAmount.toExact()) / Number(currencyAmount.toExact())) * 100

        // cal price impact
        const midPrice = bestTradeInAmount[0].swaps[0].route.midPrice
        spotOutputAmount = spotOutputAmount.add(midPrice.quote(recalInputAmount))

        routeOuts.push({
          type: PoolType.V3,
          pools: bestTradeInAmount[0].swaps[0].route.pools,
          path: bestTradeInAmount[0].swaps[0].route.tokenPath,
          percent: percent,
          inputAmount: bestTradeInAmount[0].inputAmount,
          outputAmount: bestTradeInAmount[0].outputAmount
        })

        if (remainAmountIn.lessThan(0) || remainAmountIn.equalTo(0)) {
          break
        }
      }

      if (remainAmountIn.greaterThan(0)) {
        // TODO: throw error
        throw new Error('Insufficient liquidity for this trade')
      }

      priceImpact = spotOutputAmount.subtract(totalOutputA).divide(spotOutputAmount)
      const minimumAmountOut = totalOutputA.multiply(100 - Number(slippage.value)).divide(100)

      const res = {
        tradingFee: tradingFee,
        fee: 0, // todo: không dùng fee này nữa
        priceImpact: new Percent(priceImpact.numerator, priceImpact.denominator),
        slippage: slippagePercent,
        minimumAmountOut: minimumAmountOut,
        maximumAmountIn: CurrencyAmount.fromRawAmount(token0Currency, 0),
        tradeType: type,
        inputAmount: currencyAmount,
        outputAmount: totalOutputA,
        routes: routeOuts,
        gasEstimate: gasEstimate
      }
      return res
    } else {
      const currencyAmount = CurrencyAmount.fromRawAmount(token1Currency, inputAmount)
      const bestTrades = await Trade.bestTradeExactOut(listPool, token0Currency, currencyAmount)
      console.info('🚀 ~ getBestTrade ~ bestTradesOut', bestTrades)

      let remainOutputAmount = currencyAmount
      let totalInputA: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token0Currency, 0n)
      let spotInputAmount: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token0Currency, 0)

      for (let i = 0; i < bestTrades.length; i++) {
        const bestTrade = bestTrades[i]
        const pool = bestTrade.swaps[0].route.pools[0]

        const liquidity = pool.liquidity

        const balance1 = Math.floor(Number(balances[token1][bestTrade.swaps[0].route.pools[0].address]))
        console.info('🚀 ~ getBestTrade ~ balance1:', balance1)

        // Tính số token output trước khi swap với giá hiện tại
        const currentPrice = new Decimal(pool.sqrtRatioX96.toString()).div(2 ** 96).pow(2)
        const maxPrice = currentPrice.mul(1 + slippageValue / 100)
        const _maxOutputLiquidity = Math.floor(Number(liquidity) * (maxPrice.sqrt().toNumber() - currentPrice.sqrt().toNumber()))
        const maxOutputForPool = balance1
        console.info('🚀 ~ getBestTrade ~ maxOutputForPool:', maxOutputForPool)

        const fee = bestTrade.swaps[0].route.pools[0].fee

        const maxOutput = CurrencyAmount.fromRawAmount(token0Currency, maxOutputForPool)
        let recalOutputAmount = remainOutputAmount
        if (remainOutputAmount.greaterThan(maxOutput)) {
          recalOutputAmount = maxOutput
        }

        const bestTradeInAmount = await Trade.bestTradeExactOut(bestTrade.swaps[0].route.pools, token0Currency, recalOutputAmount)

        totalInputA = totalInputA.add(bestTradeInAmount[0].inputAmount)
        newTradeList.push(...bestTradeInAmount)
        remainOutputAmount = remainOutputAmount.subtract(recalOutputAmount)
        tradingFee += (Number(fee.toString()) / BASE_FEE_PERCENT) * Number(recalOutputAmount.numerator)
        const percent = (Number(recalOutputAmount.toExact()) / Number(currencyAmount.toExact())) * 100

        // cal price impact
        const midPrice = bestTradeInAmount[0].swaps[0].route.midPrice
        console.info('🚀 ~ getBestTrade ~ recalOutputAmount:', recalOutputAmount.wrapped)
        // spotInputAmount = spotInputAmount.add(midPrice.quoteCurrency(recalOutputAmount))
        spotInputAmount = spotInputAmount.add(midPrice.invert().quote(recalOutputAmount))

        routeOuts.push({
          type: PoolType.V3,
          pools: bestTradeInAmount[0].swaps[0].route.pools,
          path: bestTradeInAmount[0].swaps[0].route.tokenPath,
          percent: percent,
          inputAmount: bestTradeInAmount[0].inputAmount,
          outputAmount: bestTradeInAmount[0].outputAmount
        })

        console.info('🚀 ~ getBestTrade ~ remainAmountIn', remainOutputAmount)
        if (remainOutputAmount.lessThan(0) || remainOutputAmount.equalTo(0)) {
          break
        }
      }

      priceImpact = spotInputAmount.subtract(totalInputA).divide(spotInputAmount)

      if (remainOutputAmount.greaterThan(0)) {
        // TODO: throw error
        throw new Error('Insufficient liquidity for this trade')
      }

      const maximumAmountIn = totalInputA.multiply(100 + Number(slippage.value)).divide(100)

      const res = {
        tradingFee: tradingFee,
        fee: 0, // todo: không dùng fee này nữa
        priceImpact: new Percent(priceImpact.numerator, priceImpact.denominator),
        slippage: slippagePercent,
        minimumAmountOut: CurrencyAmount.fromRawAmount(token0Currency, 0),
        maximumAmountIn: maximumAmountIn,
        tradeType: type,
        inputAmount: totalInputA,
        outputAmount: currencyAmount,
        routes: routeOuts,
        gasEstimate: gasEstimate
      }
      console.info('🚀 ~ getBestTrade ~ res', res)
      return res
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

// v3
const makeV3Pool = (
  tokenIn: Token,
  tokenOut: Token,
  liquidityNum: bigint,
  feeAmount: FeeAmount,
  sqrtRatioX96: bigint,
  feeProtocol: number,
  poolAddress: Address
): V3Pool => {
  const liquidity = BigInt(liquidityNum)
  const [token0ProtocolFee, token1ProtocolFee] = parseProtocolFees(feeProtocol)

  let token0 = tokenIn
  let token1 = tokenOut
  // sort token address to ensure that the pool is uniquely identified by the token0/token1 address pair
  if (!tokenIn.sortsBefore(tokenOut)) {
    token0 = tokenOut
    token1 = tokenIn
  }

  return {
    type: PoolType.V3,
    token0: token0,
    token1: token1,
    fee: feeAmount,
    liquidity,
    sqrtRatioX96,
    tick: TickMath.getTickAtSqrtRatio(sqrtRatioX96),
    address: poolAddress,
    token0ProtocolFee: token0ProtocolFee,
    token1ProtocolFee: token1ProtocolFee,
    ticks: [
      {
        index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount]),
        liquidityNet: liquidity,
        liquidityGross: liquidity
      },
      {
        index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount]),
        liquidityNet: -liquidity,
        liquidityGross: liquidity
      }
    ]
  }
}

/**
 * Returns the closest tick that is nearest a given tick and usable for the given tick spacing
 * @param tick the target tick
 * @param tickSpacing the spacing of the pool
 */
export function nearestUsableTick(tick: number, tickSpacing: number) {
  invariant(Number.isInteger(tick) && Number.isInteger(tickSpacing), 'INTEGERS')
  invariant(tickSpacing > 0, 'TICK_SPACING')
  invariant(tick >= TickMath.MIN_TICK && tick <= TickMath.MAX_TICK, 'TICK_BOUND')
  const rounded = Math.round(tick / tickSpacing) * tickSpacing
  if (rounded < TickMath.MIN_TICK) return rounded + tickSpacing
  if (rounded > TickMath.MAX_TICK) return rounded - tickSpacing
  return rounded
}

const FEE_BASE = 10n ** 4n

export function parseProtocolFees(feeProtocol: number | string) {
  const packed = Number(feeProtocol)
  if (Number.isNaN(packed)) {
    throw new Error(`Invalid fee protocol ${feeProtocol}`)
  }

  const token0ProtocolFee = packed % 2 ** 16
  const token1ProtocolFee = packed >> 16
  return [new Percent(token0ProtocolFee, FEE_BASE), new Percent(token1ProtocolFee, FEE_BASE)]
}

export function warningSeverity(priceImpact: Percent | undefined | null): 0 | 1 | 2 | 3 | 4 {
  if (!priceImpact) return 0
  if (!priceImpact?.lessThan(BLOCKED_PRICE_IMPACT_NON_EXPERT)) return 4
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) return 3
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 2
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_LOW)) return 1
  return 0
}

const BIPS_BASE = 10000n
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(100n, BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(300n, BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(500n, BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(1000n, BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(1500n, BIPS_BASE)
