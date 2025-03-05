import type { Pool } from '@monchain/v3-sdk'
import type { Abi, Address } from 'viem'
import { CONTRACT_ADDRESS } from '~/constant/contract'
import nonfungiblePositionManagerABI from '~/constant/abi/nonfungiblePositionManagerABI.json'
import { useReadContract, useBlockNumber } from '@wagmi/vue'
import { CurrencyAmount } from '@monchain/swap-sdk-core'

const MAX_UINT128 = 2n ** 128n - 1n

export default function useV3PositionFees(pool: Ref<Pool, undefined>, tokenId: Ref<bigint | undefined>, asWNATIVE = false) {
  const { contract: positionManager } = useContract(CONTRACT_ADDRESS.NFT_POSITION_MANAGER_ADDRESSES as Address, nonfungiblePositionManagerABI as Abi)

  const { data: owner } = useReadContract(
    computed(() => ({
      address: positionManager.value?.address,
      abi: positionManager.value?.abi,
      functionName: 'ownerOf',
      args: [tokenId.value],
      watch: true
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
