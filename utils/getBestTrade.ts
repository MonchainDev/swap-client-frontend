import {readContract} from '@wagmi/core'
import {config} from '~/config/wagmi'
import ABI_MON_FACTORY from '@/constant/abi/MonFactory.json'
import {CONTRACT_ADDRESS} from '~/constant/contract'
import {FEE_ALLOWANCE} from '~/utils/constanst'
import {CurrencyAmount, Token, TradeType} from '@monchain/swap-sdk-core'
import {
  FeeAmount, getOutputAmount,
  Pool as V3PoolSDK,
  Route as V3Route,
  TICK_SPACINGS,
  TickMath,
  Trade as V3Trade
} from '@monchain/v3-sdk'
import invariant from 'tiny-invariant'
import {ChainId, type Currency, Percent} from '@monchain/sdk'
import {
  type Pool,
  PoolType,
  type QuoteProvider,
  type QuoterConfig,
  RouteType,
  SmartRouter,
  type SmartRouterTrade,
  type V3Pool,
  getAmountDistribution, RouteWithoutQuote
} from '@monchain/smart-router'
import type {Address} from 'viem'
import {useGetTokenInfo} from '~/composables/useToken'
import {useGetPoolLiquidity, useGetPoolSlot} from '~/composables/usePool'
import {createViemPublicClientGetter} from './viem'
import {Trade} from './trade'

interface SwapInput {
  token0: string
  token1: string
  inputAmount: number
}

interface SwapOutput extends SmartRouterTrade<TradeType>{
  fee: FeeAmount
  priceImpact: Percent
  slippage: Percent,
  minimumAmountOut?: CurrencyAmount<Currency>
  maximumAmountIn?: CurrencyAmount<Currency>
}

export const getBestTrade = async ({ token0, token1, inputAmount }: SwapInput): Promise<SwapOutput | null> => {
  const listPool: V3Pool[] = []
  const token0Info = await useGetTokenInfo(token0)
  console.info('🚀 ~ getBestTrade ~ token0Info:', token0Info)
  const token1Info = await useGetTokenInfo(token1)
  console.info('🚀 ~ getBestTrade ~ token1Info:', token1Info)
  inputAmount = inputAmount * (10 ** token0Info.decimals as number)
  const token0Currency = new Token(token0Info.chainId, token0 as `0x${string}`, token0Info.decimals, token0Info.symbol)
  const token1Currency = new Token(token1Info.chainId, token1 as `0x${string}`, token1Info.decimals, token1Info.symbol)

  for (const fee of FEE_ALLOWANCE) {
    const pool = (await readContract(config, {
      abi: ABI_MON_FACTORY,
      address: CONTRACT_ADDRESS.MON_FACTORY as `0x${string}`,
      functionName: 'getPool',
      args: [token0 as `$0x${string}` as Address, token1 as `$0x${string}` as Address, fee]
    })) as string
    console.info('🚀 ~ getBestTrade ~ pool:', pool)
    if (pool === '0x0000000000000000000000000000000000000000') {
      continue
    }

    const slot0 = await useGetPoolSlot(pool)
    console.log('🚀 ~ getBestTrade ~ slot0:', slot0)
    const liquidity = await useGetPoolLiquidity(pool)
    console.log('🚀 ~ getBestTrade ~ liquidity:', liquidity)

    const v3Pool = makeV3Pool(token0Currency, token1Currency, liquidity, fee, slot0.sqrtPriceX96, slot0.feeProtocol, pool as `0x${string}`)
    listPool.push(v3Pool)
    console.log('🚀 ~ getBestTrade ~ v3Pool:', v3Pool)
  }

  // TODO: makeV3Trade(listPool)
  // const trade = await makeV3Trade(
  //   listPool,
  //   token0Currency,
  //   token1Currency,
  //   CurrencyAmount.fromRawAmount(token0Currency, BigInt(inputAmount)),
  //   TradeType.EXACT_INPUT
  // )

  // const newTrade = await tradeFunc({
  //   currencyAmountIn: CurrencyAmount.fromRawAmount(token0Currency, BigInt(inputAmount)),
  //   currencyOut: token1Currency,
  //   pools: listPool,
  //   gasPriceWei: 1000000000
  // });
  // console.info('🚀 ~ getBestTrade ~ trade:', trade)
  // console.info('🚀 ~ getBestTrade ~ trade in:', trade.inputAmount.toExact())
  // console.info('🚀 ~ getBestTrade ~ trade out:', trade.outputAmount.toExact())

  const distributionPercent = 5;
  const [percents, amounts] = getAmountDistribution( CurrencyAmount.fromRawAmount(token0Currency, inputAmount), distributionPercent)
      console.info(" (getBestTrade.ts:101) amounts", amounts);
      console.info(" (getBestTrade.ts:101) percents", percents);

  // Khởi tạo mảng kết quả
  const routesWithoutQuote: RouteWithoutQuote[] = [];


// Vòng lặp for thay thế reduce
  for (let i = 0; i < amounts.length; i++) {
    const curAmount = amounts[i];
    const curPercent = percents[i];

    // Lặp qua baseRoutes để tạo các RouteWithoutQuote mới
    for (let i = 0; i< listPool.length; i++) {
      const p = listPool[i]
      routesWithoutQuote.push({
        ...p,
        amount: curAmount,
        percent: curPercent,
      });
    }

    console.info(" (getBestTrade.ts:106) routesWithoutQuote", routesWithoutQuote);
  }

  const newTrade = await Trade.bestTradeExactIn(listPool, CurrencyAmount.fromRawAmount(token0Currency,
      BigInt(inputAmount)), token1Currency, {maxHops: 2, maxNumResults: 1},)
  console.info(" (getBestTrade.ts:100) newTrade", newTrade);

  // const bestTrades = await findBestPool(token0Currency, token1Currency, inputAmount, 3,5, listPool)
  // console.info(" (getBestTrade.ts:103) bestTrades", newTrade);
  return null;
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
  console.log('🚀 ~ parseProtocolFees ~ feeProtocol:', feeProtocol)
  const packed = Number(feeProtocol)
  console.log('🚀 ~ parseProtocolFees ~ packed:', packed)
  if (Number.isNaN(packed)) {
    throw new Error(`Invalid fee protocol ${feeProtocol}`)
  }

  const token0ProtocolFee = packed % 2 ** 16
  const token1ProtocolFee = packed >> 16
  return [new Percent(token0ProtocolFee, FEE_BASE), new Percent(token1ProtocolFee, FEE_BASE)]
}

const convertV3PoolToSDKPool = ({ token0, token1, fee, sqrtRatioX96, liquidity, tick, ticks }: V3Pool) =>
  new V3PoolSDK(token0.wrapped, token1.wrapped, fee, sqrtRatioX96, liquidity, tick, ticks)

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
  currencyAAmount: CurrencyAmount<Currency>,
  currencyB: Currency,
  tradeType: TradeType,
  gasPrice: bigint,
  pools?: Pool[],
  onChainQuoteProvider: QuoteProvider<QuoterConfig>,
  maxHops?: number,
  maxSplits?: number,
  blockNumber?: number,
  poolTypes?: PoolType[],
  quoteCurrencyUsdPrice?: number,
  nativeCurrencyUsdPrice?: number,
  abortController?: AbortController
}

const messageAbortControllers = new Map<number, AbortController>()

type Input = {
  currencyAmountIn: CurrencyAmount<Currency>
  currencyOut: Currency
  pools: Pool[]
  gasPriceWei?: number
} 

export const tradeFunc= async ({currencyAmountIn, currencyOut, pools, gasPriceWei}: Input) => {
  const abortController = new AbortController();
  const onChainProvider = createViemPublicClientGetter({ transportSignal: abortController.signal })

  const onChainQuoteProvider = SmartRouter.createQuoteProvider({ onChainProvider, gasLimit: 541380075 })

  let gasPrice;
  if (gasPriceWei) {
    gasPrice = BigInt(gasPriceWei);
  } else {
    gasPrice = BigInt((await onChainProvider({ chainId: ChainId.MON_TESTNET }).getGasPrice()).toString())
  }

  return await bestTradeFromSmartRouter({
    currencyAAmount: currencyAmountIn,
    currencyB: currencyOut,
    tradeType: TradeType.EXACT_INPUT,
    pools: pools,
    gasPrice: gasPrice,
    onChainQuoteProvider: onChainQuoteProvider,
    maxHops: 1,
    maxSplits: 0,
    poolTypes: [PoolType.V3],
    abortController: abortController

  });
}

export const bestTradeFromSmartRouter = (
    {currencyAAmount, currencyB, tradeType, gasPrice, pools, onChainQuoteProvider, maxHops,
      maxSplits, blockNumber, poolTypes, quoteCurrencyUsdPrice, nativeCurrencyUsdPrice,
      abortController}: TradeInput) => {
  console.info(" (getBestTrade.ts:293) onChainQuoteProvider", onChainQuoteProvider);
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
    signal: abortController?.signal,
  });
}
