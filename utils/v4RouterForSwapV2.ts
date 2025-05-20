import { V4Router, type SmartRouterTrade } from '@monchain/smart-router'
import { CurrencyAmount, TradeType, type Token } from '@monchain/swap-sdk-core'
import type { PublicClient } from 'viem'

interface SwapInput {
  token0: Token | Native
  token1: Token | Native
  inputAmount: number
  type: TradeType
  chainId: number
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
      currencyB: tokenOut,
      gasLimit: BigInt(20 * 10 ** 6) // 20M gas limit
    })
    const pools = [...v3Pools]
    console.log('🚀 ~ pools:', pools)

    console.log('🚀 ~ amount, quoteCurrency, tradeType:', amount, quoteCurrency, tradeType)
    const trade = await V4Router.getBestTrade(amount, quoteCurrency, tradeType, {
      gasPriceWei: () => publicClient.getGasPrice(),
      candidatePools: pools,
      maxHops: 2,
      maxSplits: 2 // undefined = no limit
    })

    console.log('🚀 ~ trade:', trade)
    console.log(`🚀 Trade has ${trade?.routes.length} routes`)
    console.log('🚀 ~ routes:', trade?.routes)

    if (!trade) {
      throw new Error('No trade found')
    }

    return [trade]
  } catch (error) {
    console.log('🚀 ~ error:', error)
    return Promise.reject(error)
  }
}

export const getBestTradeV4ForSwapV2 = async ({ token0, token1, inputAmount, type, chainId }: SwapInput): Promise<SmartRouterTrade<TradeType>> => {
  console.log('🚀 ~ getBestTradeV4ForSwap ~ token0:', token0)
  console.log('🚀 ~ getBestTradeV4ForSwap ~ token1:', token1)
  console.log('🚀 ~ getBestTradeV4ForSwap ~ inputAmount:', inputAmount)
  try {
    const client = publicClient({ chainId })
    const token0Currency = token0
    console.log('🚀 ~ getBestTradeV4ForSwap ~ client:', client)
    const token1Currency = token1

    const gasEstimate = await client.getGasPrice()

    if (type === TradeType.EXACT_INPUT) {
      const currencyAmount = CurrencyAmount.fromRawAmount(token0Currency, inputAmount)

      const bestTrades = await getV4Router(token0Currency, token1Currency, token1Currency, currencyAmount, TradeType.EXACT_INPUT, client)

      if (!bestTrades) {
        throw new Error('No trade found')
      }

      return {
        ...bestTrades[0],
        gasEstimate
      }
    } else {
      const currencyAmount = CurrencyAmount.fromRawAmount(token1Currency, inputAmount)

      const bestTrades = await getV4Router(token0Currency, token1Currency, token0Currency, currencyAmount, TradeType.EXACT_OUTPUT, client)
      if (!bestTrades) {
        throw new Error('No trade found')
      }

      return {
        ...bestTrades[0],
        gasEstimate
      }
    }
  } catch (error) {
    return Promise.reject(error)
  }
}
