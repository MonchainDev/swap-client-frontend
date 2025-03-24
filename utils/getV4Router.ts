import { Percent } from '@monchain/sdk'
import { PoolType, SmartRouter, V4Router, type Route, type SmartRouterTrade, type V3Pool } from '@monchain/smart-router'
import { CurrencyAmount, TradeType, type Currency, type Token } from '@monchain/swap-sdk-core'
import { TickMath } from '@monchain/v3-sdk'
import { Decimal } from 'decimal.js'
import invariant from 'tiny-invariant'
import type { PublicClient } from 'viem'

interface SwapInput {
  token0: Token | Native
  token1: Token | Native
  inputAmount: number
  type: TradeType
  chainId: number
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

const getBestRoute = async (currencyA: Token | Native, currencyB: Token | Native, publicClient: PublicClient) => {
  return await SmartRouter.getV3CandidatePools({
    onChainProvider: () => publicClient,
    //@ts-ignore
    subgraphProvider: () => getGraphQLClient(currencyA.chainId),
    currencyA,
    currencyB,
    subgraphFallback: true
  })
}

const _getBestTrade = async (
  tokenIn: Token | Native,
  tokenOut: Token | Native,
  inputAmount: CurrencyAmount<Currency>,
  tradeType: TradeType,
  publicClient: PublicClient
): Promise<SmartRouterTrade<TradeType>[] | undefined> => {
  console.log('🚀 ~ publicClient:', publicClient)
  try {
    const _v3Pools = await getBestRoute(tokenIn, tokenOut, publicClient)
    console.log('>>> / _v3Pools:', _v3Pools)
    const quoteProvider = SmartRouter.createQuoteProvider({
      onChainProvider: () => publicClient
    })
    const poolProvider = SmartRouter.createStaticPoolProvider(_v3Pools)

    const _trade = await SmartRouter.getBestTrade(inputAmount, tokenOut, tradeType, {
      gasPriceWei: () => publicClient.getGasPrice(),
      maxHops: 2,
      maxSplits: 3,
      poolProvider,
      quoteProvider,
      quoterOptimization: true,
      distributionPercent: 10
    })
    if (!_trade) {
      throw new Error('No trade found')
    } else {
      return [_trade]
    }
  } catch (error) {
    console.log('🚀 ~ testRoute ~ error:', error)
  }
}

const getV4Router = async (
  tokenIn: Token | Native,
  tokenOut: Token | Native,
  quoteCurrency: Token | Native,
  amount: CurrencyAmount<Token | Native>,
  tradeType: TradeType,
  publicClient: PublicClient
) => {
  try {
    const v3Pools = await V4Router.getV3CandidatePools({
      clientProvider: () => publicClient,
      currencyA: tokenIn,
      currencyB: tokenOut
    })
    console.log('🚀 ~ getV4Router ~ v3Pools:', v3Pools)
    const pools = [...v3Pools]
    const trade = await V4Router.getBestTrade(amount, quoteCurrency, tradeType, {
      gasPriceWei: () => publicClient.getGasPrice(),
      candidatePools: pools
    })
    console.log('🚀 ~ getV4Router ~ trade:', trade)
    if (!trade) {
      throw new Error('No trade found')
    }
    return [trade]
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getBestTradeV4 = async ({ token0, token1, inputAmount, type, chainId }: SwapInput): Promise<SwapOutput> => {
  try {
    const client = publicClient({ chainId })
    const token0Currency = token0
    console.log('🚀 ~ getBestTradeV2 ~ client:', client)
    const token1Currency = token1
    const balances: { [key: string]: { [key: string]: bigint } } = {}
    let tradingFee = 0
    const routeOuts: Route[] = []
    const newTradeList: Trade<Currency, Token, TradeType>[] = []

    const { slippage } = storeToRefs(useSwapStore())
    const slippageValue = Number(slippage.value)

    const gasEstimate = await client.getGasPrice()

    const slippagePercent = new Percent(Number(slippage.value))

    let priceImpact: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token1Currency, 0)

    if (type === TradeType.EXACT_INPUT) {
      const currencyAmount = CurrencyAmount.fromRawAmount(token0Currency, inputAmount)

      const bestTrades = await getV4Router(token0Currency, token1Currency, token1Currency, currencyAmount, TradeType.EXACT_INPUT, client)
      let remainAmountIn = currencyAmount
      let totalOutputA: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token1Currency, 0n)
      let spotOutputAmount: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token1Currency, 0)

      if (!bestTrades) {
        throw new Error('No trade found')
      }

      for (let i = 0; i < bestTrades.length; i++) {
        const bestTrade = bestTrades[i]
        const pool = bestTrade.routes[0].pools[0] as V3Pool
        const liquidity = pool.liquidity

        console.log('🚀 ~ getBestTrade ~ balances:', balances)

        // Tính số token output trước khi swap với giá hiện tại
        const currentPrice = new Decimal(pool.sqrtRatioX96.toString()).div(2 ** 96).pow(2)
        const minPrice = currentPrice.mul(1 - slippageValue / 100)
        const _maxInputLiquidity = Math.floor(Number(liquidity) * (1 / minPrice.sqrt().toNumber() - 1 / currentPrice.sqrt().toNumber()))

        const fee = pool.fee
        console.info(pool.address, fee.toString())

        const recalInputAmount = remainAmountIn

        const bestTradeInAmount = await Trade.bestTradeExactIn(bestTrade.routes[0].pools as V3Pool[], recalInputAmount, token1Currency)
        if (!bestTradeInAmount.length) {
          throw new Error('bestTradeExactIn not found')
        }
        // if (bestTradeInAmount[0].outputAmount.greaterThan(balance1)) {
        //   continue
        // }

        totalOutputA = totalOutputA.add(bestTradeInAmount[0].outputAmount)
        newTradeList.push(...(bestTradeInAmount as Trade<Currency, Token, TradeType>[]))
        remainAmountIn = remainAmountIn.subtract(recalInputAmount)
        console.log('🚀 ~ getBestTrade ~ recalInputAmount:', recalInputAmount)

        tradingFee += (Number(fee.toString()) / BASE_FEE_PERCENT) * Number(recalInputAmount.numerator)
        const percent = (Number(recalInputAmount.toExact()) / Number(currencyAmount.toExact())) * 100

        // cal price impact
        const midPrice = bestTradeInAmount[0].swaps[0].route.midPrice
        console.log('🚀 ~ getBestTrade ~ midPrice:', midPrice)
        spotOutputAmount = spotOutputAmount.add(midPrice.quote(recalInputAmount))

        routeOuts.push({
          //@ts-ignore
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
      //   const bestTrades = await Trade.bestTradeExactOut(listPool, token0Currency, currencyAmount)
      // const bestTrades = await _getBestTrade(token1Currency, token0Currency, currencyAmount, TradeType.EXACT_OUTPUT, client)
      const bestTrades = await getV4Router(token0Currency, token1Currency, token0Currency, currencyAmount, TradeType.EXACT_OUTPUT, client)
      if (!bestTrades) {
        throw new Error('No trade found')
      }
      console.info('🚀 ~ getBestTrade ~ bestTradesOut', bestTrades)

      let remainOutputAmount = currencyAmount
      let totalInputA: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token0Currency, 0n)
      let spotInputAmount: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token0Currency, 0)

      for (let i = 0; i < bestTrades.length; i++) {
        const bestTrade = bestTrades[i]
        const pool = bestTrade.routes[0].pools[0] as V3Pool
        const liquidity = pool.liquidity

        // const balance1 = Math.floor(Number(balances[token1][bestTrade.swaps[0].route.pools[0].address]))
        // console.info('🚀 ~ getBestTrade ~ balance1:', balance1)

        // Tính số token output trước khi swap với giá hiện tại
        const currentPrice = new Decimal(pool.sqrtRatioX96.toString()).div(2 ** 96).pow(2)
        const maxPrice = currentPrice.mul(1 + slippageValue / 100)
        const _maxOutputLiquidity = Math.floor(Number(liquidity) * (maxPrice.sqrt().toNumber() - currentPrice.sqrt().toNumber()))
        // const maxOutputForPool = balance1
        // console.info('🚀 ~ getBestTrade ~ maxOutputForPool:', maxOutputForPool)

        const fee = pool.fee

        // const maxOutput = CurrencyAmount.fromRawAmount(token0Currency, maxOutputForPool)
        const recalOutputAmount = remainOutputAmount
        // if (remainOutputAmount.greaterThan(maxOutput)) {
        //   recalOutputAmount = maxOutput
        // }

        const bestTradeInAmount = await Trade.bestTradeExactOut(bestTrade.routes[0].pools as V3Pool[], token0Currency, recalOutputAmount)

        if (!bestTradeInAmount.length) {
          throw new Error('bestTradeExactOut not found')
        }

        totalInputA = totalInputA.add(bestTradeInAmount[0].inputAmount)
        newTradeList.push(...(bestTradeInAmount as Trade<Currency, Token, TradeType>[]))
        remainOutputAmount = remainOutputAmount.subtract(recalOutputAmount)
        tradingFee += (Number(fee.toString()) / BASE_FEE_PERCENT) * Number(totalInputA.numerator)
        const percent = (Number(recalOutputAmount.toExact()) / Number(currencyAmount.toExact())) * 100

        // cal price impact
        const midPrice = bestTradeInAmount[0].swaps[0].route.midPrice
        console.info('🚀 ~ getBestTrade ~ recalOutputAmount:', recalOutputAmount.wrapped)
        // spotInputAmount = spotInputAmount.add(midPrice.quoteCurrency(recalOutputAmount))
        spotInputAmount = spotInputAmount.add(midPrice.invert().quote(recalOutputAmount))

        routeOuts.push({
          //@ts-ignore
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
