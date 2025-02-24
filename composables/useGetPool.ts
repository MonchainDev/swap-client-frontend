import { readContract } from '@wagmi/core'
import { config } from '~/config/wagmi'
import ABI_MON_FACTORY from '@/constant/abi/MonFactory.json'
import { CONTRACT_ADDRESS } from '~/constant/contract'

export default function useGetPool() {
  const getAllPools = async () => {
    const listPool = (await readContract(config, {
      abi: ABI_MON_FACTORY,
      address: CONTRACT_ADDRESS.MON_FACTORY as `0x${string}`,
      functionName: 'getAllPools'
    })) as string[]

    return listPool
  }

  return {
    getAllPools
  }
}
