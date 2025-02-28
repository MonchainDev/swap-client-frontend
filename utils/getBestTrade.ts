import { readContract } from '@wagmi/core'
import { config } from '~/config/wagmi'
import ABI_MON_FACTORY from '@/constant/abi/MonFactory.json'
import { CONTRACT_ADDRESS } from '~/constant/contract'
import { FEE_ALLOWANCE } from '~/utils/constanst'
import { CurrencyAmount, Token, TradeType } from '@monchain/swap-sdk-core'
import { TICK_SPACINGS, TickMath, Pool as V3PoolSDK, Route as V3Route, Trade as V3Trade } from '@monchain/v3-sdk'
import type { FeeAmount } from '@monchain/v3-sdk'
import invariant from 'tiny-invariant'
import { Percent, type Currency } from '@monchain/sdk'
import { PoolType, RouteType, type SmartRouterTrade, type V3Pool } from '@monchain/smart-router'
import type { Address } from 'viem'
import { useGetTokenInfo } from '~/composables/useToken'
import { useGetPoolLiquidity, useGetPoolSlot } from '~/composables/usePool'

interface SwapInput {
  token0: string
  token1: string
  inputAmount: number
}

export const getBestTrade = async ({ token0, token1, inputAmount }: SwapInput) => {
  const listPool: V3Pool[] = []
  const token0Info = await useGetTokenInfo(token0)
  console.info('🚀 ~ getBestTrade ~ token0Info:', token0Info)
  const token1Info = await useGetTokenInfo(token1)
  console.info('🚀 ~ getBestTrade ~ token1Info:', token1Info)
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
  const trade = await makeV3Trade(
    listPool,
    token0Currency,
    token1Currency,
    CurrencyAmount.fromRawAmount(token0Currency, BigInt(inputAmount)),
    TradeType.EXACT_INPUT
  )
  console.info('🚀 ~ getBestTrade ~ trade:', trade)

  return trade
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

const makeV3Trade = async (
  pools: V3Pool[],
  tokenIn: Currency,
  tokenOut: Currency,
  amount: CurrencyAmount<Currency>,
  tradeType: TradeType
): Promise<SmartRouterTrade<TradeType>> => {
  console.log('🚀 ~ tradeType:', tradeType)
  console.log('🚀 ~ amount:', amount)
  console.log('🚀 ~ tokenOut:', tokenOut)
  console.log('🚀 ~ tokenIn:', tokenIn)
  const v3Pools = pools.map(convertV3PoolToSDKPool)
  console.log('🚀 ~ v3Pools:', v3Pools)
  const v3Route = new V3Route(v3Pools, tokenIn, tokenOut)
  console.log('🚀 ~ v3Route:', v3Route)
  const v3Trade = await V3Trade.fromRoute(v3Route, amount, tradeType)
  return {
    tradeType,
    inputAmount: v3Trade.inputAmount,
    outputAmount: v3Trade.outputAmount,
    routes: [
      {
        type: RouteType.V3,
        pools,
        path: v3Trade.swaps[0].route.tokenPath,
        percent: 100,
        inputAmount: v3Trade.inputAmount,
        outputAmount: v3Trade.outputAmount
      }
    ],
    gasEstimate: 0n,
    gasEstimateInUSD: CurrencyAmount.fromRawAmount(tokenIn, 0),
    blockNumber: 0
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
