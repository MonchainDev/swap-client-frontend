import ABI_MON_FACTORY from '@/constant/abi/MonFactory.json'
import ABI_ERC20 from '@/constant/abi/token.json'
import { type Currency, Percent } from '@monchain/sdk'
import { getAmountDistribution, type Pool, PoolType, type QuoteProvider, type QuoterConfig, SmartRouter, type SmartRouterTrade, type V3Pool } from '@monchain/smart-router'
import { CurrencyAmount, Token, TradeType } from '@monchain/swap-sdk-core'
import { FeeAmount } from '@monchain/v3-sdk'
import { TICK_SPACINGS, TickMath, Pool as V3PoolSDK, Route as V3Route, Trade as V3Trade } from '@monchain/v3-sdk'
import { readContract } from '@wagmi/core'
import invariant from 'tiny-invariant'
import type { Address } from 'viem'
import { useGetPoolLiquidity, useGetPoolSlot } from '~/composables/usePool'
import { useGetTokenInfo } from '~/composables/useToken'
import { config } from '~/config/wagmi'
import { CONTRACT_ADDRESS } from '~/constant/contract'
import { FEE_ALLOWANCE } from '~/utils/constanst'
import { Trade } from './trade'

interface SwapInput {
  token0: string
  token1: string
  inputAmount: number
  type: TradeType
}

export interface SwapOutput extends SmartRouterTrade<TradeType> {
  tradingFee: number
  fee: number
  priceImpact: Percent
  slippage: Percent
  minimumAmountOut?: CurrencyAmount<Currency>
  maximumAmountIn?: CurrencyAmount<Currency>
}

// export interface BaseRoute {
//   type: RouteType;
//   pools: V3Pool[];
//   path: Currency[];
//   input: Currency;
//   output: Currency;
// }
// export interface RouteWithoutQuote extends BaseRoute {
//   percent: number;
//   amount: CurrencyAmount<Currency>;
// }

const BASE_FEE_PERCENT = 10 ** 6;

export const getBestTrade = async ({ token0, token1, inputAmount, type }: SwapInput): Promise<SwapOutput> => {
  const listPool: V3Pool[] = []
  const token0Info = await useGetTokenInfo(token0)
  const token1Info = await useGetTokenInfo(token1)
  inputAmount = inputAmount * ((10 ** token0Info.decimals) as number)
  const token0Currency = new Token(token0Info.chainId, token0 as `0x${string}`, token0Info.decimals, token0Info.symbol)
  const token1Currency = new Token(token1Info.chainId, token1 as `0x${string}`, token1Info.decimals, token1Info.symbol)
  const balances: { [key: string]: { [key: string]: bigint } } = {}

  for (const fee of FEE_ALLOWANCE) {
    const pool = (await readContract(config, {
      abi: ABI_MON_FACTORY,
      address: CONTRACT_ADDRESS.MON_FACTORY as `0x${string}`,
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

    if (!balances[token0]) balances[token0] = {}
    if (!balances[token1]) balances[token1] = {}

    balances[token0][pool] = balanceToken0
    balances[token1][pool] = balanceToken1

    const v3Pool = makeV3Pool(token0Currency, token1Currency, liquidity, fee, slot0.sqrtPriceX96, slot0.feeProtocol, pool as `0x${string}`)
    listPool.push(v3Pool)
  }

  const currencyAmountIn = CurrencyAmount.fromRawAmount(token0Currency, inputAmount)
  const bestTrades = await Trade.bestTradeExactIn(listPool, CurrencyAmount.fromRawAmount(token0Currency, inputAmount), token1Currency)

  let remainAmountIn = currencyAmountIn;
  let totalOutputA: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(token1Currency, 0n);
  let tradingFee = 0;
  let priceImpact: Percent = new Percent(0, 100)
  const newTradeList: Trade<Currency, Token, TradeType.EXACT_INPUT>[] = []
  for (let i = 0; i < bestTrades.length; i++) {
    const bestTrade = bestTrades[i]
    const fee = bestTrade.swaps[0].route.pools[0].fee;
    const maxInput = CurrencyAmount.fromRawAmount(token0Currency, Number(balances[token0][bestTrade.swaps[0].route.pools[0].address]) * 0.9)
    let recalInputAmount = remainAmountIn;
    if (remainAmountIn.greaterThan(maxInput)) {
      recalInputAmount = maxInput
    }
    const bestTradeInAmount = await Trade.bestTradeExactIn(bestTrade.swaps[0].route.pools, recalInputAmount, token1Currency)
    totalOutputA = totalOutputA.add(bestTradeInAmount[0].outputAmount)
    priceImpact = priceImpact.add(bestTradeInAmount[0].priceImpact)
    newTradeList.push(...bestTradeInAmount)
    remainAmountIn = remainAmountIn.subtract(recalInputAmount)
    tradingFee += Number(fee.toString()) / BASE_FEE_PERCENT * Number(recalInputAmount.toExact())
    if (remainAmountIn.numerator <= 0) {
      break
    }
  }

  if (remainAmountIn.numerator > 0) {
    console.error("Khoong du tien", remainAmountIn)
  }

  console.info("🚀 ~ getBestTrade ~ newTradeList: ", newTradeList)
  console.info("🚀 ~ getBestTrade ~ totalOutputA: ", totalOutputA.toExact())

  // const bestTrades = await findBestPool(token0Currency, token1Currency, inputAmount, 3,5, listPool)
  // console.info(" (getBestTrade.ts:103) bestTrades", newTrade);
  const { slippage } = storeToRefs(useSwapStore())
  console.info(' (getBestTrade.ts:133) slippage', slippage.value)
  const slippagePercent = new Percent(Number(slippage.value))
  const minimumAmountOut = totalOutputA.multiply(1 - Number(slippage.value)/100)
  return {
    tradingFee: tradingFee,
    fee: 0,
    priceImpact: priceImpact,
    slippage: slippagePercent,
    minimumAmountOut: minimumAmountOut,
    maximumAmountIn: CurrencyAmount.fromRawAmount(token0Currency, 0),
    tradeType: type,
    inputAmount: currencyAmountIn,
    outputAmount: totalOutputA,
    routes: [
      // {
      //   type: PoolType.V3,
      //   pools: listPool,
      //   path: trade.swaps[0].route.tokenPath,
      //   percent: 100,
      //   inputAmount: trade.inputAmount,
      //   outputAmount: trade.outputAmount
      // }
    ],
    gasEstimate: BigInt(1000000)
  }
}

// v3
const makeV3Pool = (
  token0: Token,
  token1: Token,
  liquidityNum: bigint,
  feeAmount: FeeAmount,
  sqrtRatioX96: bigint,
  feeProtocol: number,
  poolAddress: Address
): V3Pool => {
  const liquidity = BigInt(liquidityNum)
  const [token0ProtocolFee, token1ProtocolFee] = parseProtocolFees(feeProtocol)

  return {
    type: PoolType.V3,
    token0,
    token1,
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

type TradeInput = {
  currencyAAmount: CurrencyAmount<Currency>
  currencyB: Currency
  tradeType: TradeType
  gasPrice: bigint
  pools?: Pool[]
  onChainQuoteProvider: QuoteProvider<QuoterConfig>
  maxHops?: number
  maxSplits?: number
  blockNumber?: number
  poolTypes?: PoolType[]
  quoteCurrencyUsdPrice?: number
  nativeCurrencyUsdPrice?: number
  abortController?: AbortController
}

// const messageAbortControllers = new Map<number, AbortController>()

// type Input = {
//   currencyAmountIn: CurrencyAmount<Currency>
//   currencyOut: Currency
//   pools: Pool[]
//   gasPriceWei?: number
// }

// export const tradeFunc= async ({currencyAmountIn, currencyOut, pools, gasPriceWei}: Input) => {
//   const abortController = new AbortController();
//   const onChainProvider = createViemPublicClientGetter({ transportSignal: abortController.signal })
//
//   const onChainQuoteProvider = SmartRouter.createQuoteProvider({ onChainProvider, gasLimit: 541380075 })
//
//   let gasPrice;
//   if (gasPriceWei) {
//     gasPrice = BigInt(gasPriceWei);
//   } else {
//     gasPrice = BigInt((await onChainProvider({ chainId: ChainId.MON_TESTNET }).getGasPrice()).toString())
//   }
//
//   return await bestTradeFromSmartRouter({
//     currencyAAmount: currencyAmountIn,
//     currencyB: currencyOut,
//     tradeType: TradeType.EXACT_INPUT,
//     pools: pools,
//     gasPrice: gasPrice,
//     onChainQuoteProvider: onChainQuoteProvider,
//     maxHops: 1,
//     maxSplits: 0,
//     poolTypes: [PoolType.V3],
//     abortController: abortController
//
//   });
// }

export const bestTradeFromSmartRouter = ({
  currencyAAmount,
  currencyB,
  tradeType,
  gasPrice,
  pools,
  onChainQuoteProvider,
  maxHops,
  maxSplits,
  blockNumber,
  poolTypes,
  quoteCurrencyUsdPrice,
  nativeCurrencyUsdPrice,
  abortController
}: TradeInput) => {
  console.info(' (getBestTrade.ts:293) onChainQuoteProvider', onChainQuoteProvider)
  return SmartRouter.getBestTrade(currencyAAmount, currencyB, tradeType, {
    gasPriceWei: gasPrice,
    poolProvider: SmartRouter.createStaticPoolProvider(pools),
    quoteProvider: onChainQuoteProvider,
    maxHops,
    maxSplits,
    blockNumber: blockNumber ? Number(blockNumber) : undefined,
    allowedPoolTypes: poolTypes,
    quoterOptimization: false,
    quoteCurrencyUsdPrice,
    nativeCurrencyUsdPrice,
    signal: abortController?.signal
  })
}
