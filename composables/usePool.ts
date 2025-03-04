import { readContract } from '@wagmi/core'
import { config } from '~/config/wagmi'
import MON_POOL from '@/constant/abi/MonPool.json'

export const useGetPoolSlot = async (poolAddress: string) => {
  const slot0 = (await readContract(config, {
    abi: MON_POOL,
    address: poolAddress as `0x${string}`,
    functionName: 'slot0'
  })) as [bigint, number, number, number, number, number, boolean]
  return {
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
    observationIndex: slot0[2],
    observationCardinality: slot0[3],
    observationCardinalityNext: slot0[4],
    feeProtocol: slot0[5],
    unlocked: slot0[6]
  }
}

export const useGetTickSpacing = async (poolAddress: string) => {
  return (await readContract(config, {
    abi: MON_POOL,
    address: poolAddress as `0x${string}`,
    functionName: 'tickSpacing'
  })) as bigint
}

export const useGetPoolLiquidity = async (poolAddress: string) => {
  return (await readContract(config, {
    abi: MON_POOL,
    address: poolAddress as `0x${string}`,
    functionName: 'liquidity'
  })) as bigint
}
