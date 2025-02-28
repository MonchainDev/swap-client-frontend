import { CONTRACT_ADDRESS } from '~/constant/contract'
import nonfungiblePositionManagerABI from '~/constant/abi/nonfungiblePositionManagerABI.json'
import type { Abi, Address } from 'viem'
import { useAccount, useReadContract } from '@wagmi/vue'
import type { PositionDetail } from '~/types'

export default function useV3PositionsFromTokenId(tokenId: bigint | undefined) {
  const { contract: positionManager } = useContract(CONTRACT_ADDRESS.NFT_POSITION_MANAGER_ADDRESSES as Address, nonfungiblePositionManagerABI as Abi)

  const { chainId } = useAccount()

  const { isLoading, data, status } = useReadContract({
    abi: positionManager.value?.abi,
    //@ts-ignore
    address: positionManager.value?.address as MaybeRef<`0x${string}`>,
    functionName: 'positions',
    args: [tokenId],
    chainId: chainId.value as 16789 | 11155111 | undefined,
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

  return { isLoading, position }
}
