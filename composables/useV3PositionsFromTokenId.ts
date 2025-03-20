import addresses from '@/config/contracts'
import { useReadContract } from '@wagmi/vue'
import type { Abi } from 'viem'
import nonfungiblePositionManagerABI from '~/constant/abi/nonfungiblePositionManagerABI.json'
import type { ChainId, PositionDetail } from '~/types'

export default function useV3PositionsFromTokenId(tokenId: bigint | undefined) {
  const { chainId } = useActiveChainId()

  const { contract: positionManager } = useContract(addresses.nftPositionManager[chainId.value as ChainId], nonfungiblePositionManagerABI as Abi)

  const { isLoading, data, status, refetch } = useReadContract({
    abi: positionManager.value?.abi,
    //@ts-ignore
    address: positionManager.value?.address as MaybeRef<`0x${string}`>,
    functionName: 'positions',
    args: [tokenId],
    chainId: chainId.value,
    queryKey: ['v3PositionsFromTokenId', tokenId],
    query: {
      enabled: !!tokenId
    },
    watch: true
  })

  const position = computed(() => {
    if (status.value === 'success') {
      const r = data.value as [bigint, string, string, string, number, number, number, bigint, bigint, bigint, bigint, bigint]
      return {
        nonce: r[0],
        operator: r[1],
        token0: r[2],
        token1: r[3],
        fee: r[4],
        tickLower: r[5],
        tickUpper: r[6],
        liquidity: r[7],
        feeGrowthInside0LastX128: r[8],
        feeGrowthInside1LastX128: r[9],
        tokensOwed0: r[10],
        tokensOwed1: r[11],
        tokenId: tokenId as bigint
      } as PositionDetail
    }
  })

  return { isLoading, position, refetch }
}
