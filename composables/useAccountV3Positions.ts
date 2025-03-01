import { useQuery } from '@tanstack/vue-query'
import { useAccount } from '@wagmi/vue'
import type { Address } from 'viem'
import { SLOW_INTERVAL } from '~/constant'
import type { PositionDetail } from '~/types'

export default function useAccountV3Positions(chainIds: Ref<number[]>) {
  const { address } = useAccount()

  const getAccountV3Positions = async (chainId: number, account: Address): Promise<PositionDetail[]> => {
    const { farmingTokenIds, nonFarmTokenIds } = await getAccountV3TokenIds(chainId, account)
    console.log('🚀 ~ getAccountV3Positions ~ farmingTokenIds:', farmingTokenIds)
    console.log('🚀 ~ getAccountV3Positions ~ nonFarmTokenIds:', nonFarmTokenIds)

    const positions = await readPositions(chainId, farmingTokenIds.concat(nonFarmTokenIds))

    const farmingTokenIdsLength = farmingTokenIds.length
    positions.forEach((_, index) => {
      positions[index].isStaked = index < farmingTokenIdsLength
    })

    return positions
  }

  const { data, isPending } = useQuery<PositionDetail[], Error>({
    queryKey: ['accountV3Positions', address.value, chainIds.value.join('-')],

    queryFn: async () => {
      if (!address.value) return []
      const results = await Promise.all(
        chainIds.value.map(async (chainId) => {
          try {
            const positions = await getAccountV3Positions(chainId, address.value as Address)
            console.log('🚀 ~ chainIds.value.map ~ positions:', positions)
            return positions ?? []
          } catch (error) {
            console.error(`Error fetching V3 positions for chainId ${chainId}:`, error)
            return []
          }
        })
      )
      return results.flat()
    },
    enabled: Boolean(address.value),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: SLOW_INTERVAL,
    // Prevents re-fetching while the data is still fresh
    staleTime: SLOW_INTERVAL
  })

  return { data: data ?? [], isPending }
}
