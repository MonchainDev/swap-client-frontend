import { readContract } from '@wagmi/core'
import { config } from '~/config/wagmi'
import ABI_MON_FACTORY from '@/constant/abi/MonFactory.json'
import { CONTRACT_ADDRESS } from '~/constant/contract'

interface PoolInput {
  token0: string;
  token1: string;
  fee: number;
}

type PoolInfo = {
  token0: string;
  token1: string;
  fee: number;
  pool: string;
}

export const useGetPool = async ({token0, token1, fee}: PoolInput) : Promise<PoolInfo | null> => {
  const pool = (await readContract(config, {
    abi: ABI_MON_FACTORY,
    address: CONTRACT_ADDRESS.MON_FACTORY as `0x${string}`,
    functionName: 'getPool',
    args: [token0, token1, fee]
  })) as string
  if (pool !== '0x0000000000000000000000000000000000000000') {
    return {
      token0,
      token1,
      fee,
      pool
    }
  }
  return null
}
