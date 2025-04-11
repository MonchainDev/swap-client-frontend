import { Percent } from '@monchain/sdk'
import { PoolType, V4Router, type Route, type SmartRouterTrade, type V3Pool } from '@monchain/smart-router'
import { CurrencyAmount, TradeType, type Currency, type Token } from '@monchain/swap-sdk-core'
import { Decimal } from 'decimal.js'
import type { PublicClient } from 'viem'

interface SwapInput {
  token0: Token | Native
  token1: Token | Native
  inputAmount: number
  type: TradeType
  chainId: number
}

interface SwapOutput extends SmartRouterTrade<TradeType> {
  tradingFee: number
  fee: number
  priceImpact: Percent
  slippage: Percent
  minimumAmountOut?: CurrencyAmount<Currency>
  maximumAmountIn?: CurrencyAmount<Currency>
}

const BASE_FEE_PERCENT = 10 ** 6

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
      currencyB: tokenOut,
      gasLimit: BigInt(20 * 10 ** 6) // 20M gas limit
    })
    const pools = [...v3Pools]
    console.log('🚀 ~ pools:', pools)
    const trade = await V4Router.getBestTrade(amount, quoteCurrency, tradeType, {
      gasPriceWei: () => publicClient.getGasPrice(),
      candidatePools: pools,
      maxHops: 3,
      maxSplits: undefined // undefined = no limit
    })
    console.log('🚀 ~ getV4Router ~ trade:', trade)
    if (!trade) {
      throw new Error('No trade found')
    }

    return [trade]
  } catch (error) {
    console.log('🚀 ~ error:', error)
    return Promise.reject(error)
  }
}

export const getBestTradeV4ForSwap = async ({ token0, token1, inputAmount, type, chainId }: SwapInput): Promise<SwapOutput> => {
  console.log('🚀 ~ getBestTradeV4ForSwap ~ token0:', token0)
  console.log('🚀 ~ getBestTradeV4ForSwap ~ token1:', token1)
  console.log('🚀 ~ getBestTradeV4ForSwap ~ inputAmount:', inputAmount)
  try {
    const client = publicClient({ chainId })
    const token0Currency = token0
    console.log('🚀 ~ getBestTradeV4ForSwap ~ client:', client)
    const token1Currency = token1
    // const balances: { [key: string]: { [key: string]: bigint } } = {}
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
      const inputAmountWithGasAdjusted = currencyAmount
      let outputAmountWithGasAdjusted = CurrencyAmount.fromRawAmount(token1Currency, 0)

      if (!bestTrades) {
        throw new Error('No trade found')
      }

      for (let i = 0; i < bestTrades.length; i++) {
        const bestTrade = bestTrades[i]
        const pool = bestTrade.routes[0].pools[0] as V3Pool
        const liquidity = pool.liquidity

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
        outputAmountWithGasAdjusted = outputAmountWithGasAdjusted.add(bestTrade.outputAmountWithGasAdjusted)
        newTradeList.push(...(bestTradeInAmount as Trade<Currency, Token, TradeType>[]))
        remainAmountIn = remainAmountIn.subtract(recalInputAmount)

        tradingFee += (Number(fee.toString()) / BASE_FEE_PERCENT) * Number(recalInputAmount.numerator)
        const percent = (Number(recalInputAmount.toExact()) / Number(currencyAmount.toExact())) * 100

        // cal price impact
        const midPrice = bestTradeInAmount[0].swaps[0].route.midPrice
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
      console.log('🚀 ~ getBestTradeV4ForSwap ~ totalOutputA:', totalOutputA.toExact())
      console.log('🚀 ~ getBestTradeV4ForSwap ~ res.outputAmountWithGasAdjusted:', outputAmountWithGasAdjusted.toExact())

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
        gasEstimate: gasEstimate,
        inputAmountWithGasAdjusted,
        outputAmountWithGasAdjusted
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

      let remainOutputAmount = currencyAmount
      let totalInputA: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token0Currency, 0n)
      let spotInputAmount: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token0Currency, 0)
      let inputAmountWithGasAdjusted = CurrencyAmount.fromRawAmount(token0Currency, 0)
      const outputAmountWithGasAdjusted = currencyAmount

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
        inputAmountWithGasAdjusted = inputAmountWithGasAdjusted.add(bestTrade.inputAmountWithGasAdjusted)
        newTradeList.push(...(bestTradeInAmount as Trade<Currency, Token, TradeType>[]))
        remainOutputAmount = remainOutputAmount.subtract(recalOutputAmount)
        tradingFee += (Number(fee.toString()) / BASE_FEE_PERCENT) * Number(totalInputA.numerator)
        const percent = (Number(recalOutputAmount.toExact()) / Number(currencyAmount.toExact())) * 100

        // cal price impact
        const midPrice = bestTradeInAmount[0].swaps[0].route.midPrice
        // console.info('🚀 ~ getBestTradeV4ForSwap ~ recalOutputAmount:', recalOutputAmount.wrapped)
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

        // console.info('🚀 ~ getBestTradeV4ForSwap ~ remainAmountIn', remainOutputAmount)
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
        gasEstimate: gasEstimate,
        inputAmountWithGasAdjusted,
        outputAmountWithGasAdjusted
      }
      console.info('🚀 ~ getBestTradeV4ForSwap ~ res', res)
      return res
    }
  } catch (error) {
    return Promise.reject(error)
  }
}
