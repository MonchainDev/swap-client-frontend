import addresses from '@/config/contracts'
import { CurrencyAmount } from '@wicchain/swap-sdk-core'
import type { Pool } from '@wicchain/v3-sdk'
import { useBlockNumber, useReadContract } from '@wagmi/vue'
import type { Abi, Address } from 'viem'
import nonfungiblePositionManagerABI from '~/constant/abi/nonfungiblePositionManagerABI.json'
import type { ChainId } from '~/types'

const MAX_UINT128 = 2n ** 128n - 1n

export default function useV3PositionFees(pool: Ref<Pool, undefined>, asWNATIVE = false) {
  const { chainId } = useActiveChainId()

  const { tokenId: tokenIdRemove } = useRoute('remove-network-tokenId').params
  const { tokenId: tokenIdPosition } = useRoute('liquidity-network-tokenId').params

  const tokenId = computed(() => tokenIdRemove || tokenIdPosition)

  const { contract: positionManager } = useContract(addresses.nftPositionManager[chainId.value as ChainId], nonfungiblePositionManagerABI as Abi)

  const { data: owner } = useReadContract(
    computed(() => ({
      address: positionManager.value?.address,
      abi: positionManager.value?.abi,
      functionName: 'ownerOf',
      args: [tokenId.value],
      watch: true,
      chainId: chainId.value
    }))
  )

  const { data: latestBlockNumber } = useBlockNumber()

  const amounts = ref<[bigint, bigint] | undefined>(undefined)

  watchEffect(async () => {
    if (positionManager.value && typeof tokenId.value !== 'undefined' && owner.value && latestBlockNumber.value) {
      try {
        const results: { result: [bigint, bigint] } = await positionManager.value.simulate.collect(
          [
            {
              tokenId: tokenId.value,
              recipient: owner.value as Address, // some tokens might fail if transferred to address(0)
              amount0Max: MAX_UINT128,
              amount1Max: MAX_UINT128
            }
          ],
          { account: owner.value as Address, value: 0n } // need to simulate the call as the owner
        )

        const [amount0, amount1] = results.result
        amounts.value = [amount0, amount1]
      } catch (error) {
        console.error('Error in simulation:', error)
      }
    }
  })

  const feeValue0 = computed(() => {
    if (pool.value && amounts.value) {
      return CurrencyAmount.fromRawAmount(asWNATIVE ? pool.value.token0 : unwrappedToken(pool.value.token0)!, amounts.value[0].toString())
    }
    return undefined
  })
  const feeValue1 = computed(() => {
    if (pool.value && amounts.value) {
      return CurrencyAmount.fromRawAmount(asWNATIVE ? pool.value.token1 : unwrappedToken(pool.value.token1)!, amounts.value[1].toString())
    }
    return undefined
  })

  return { feeValue0, feeValue1, owner }
}
