// composables/useV3TokenIdsByAccount.ts
import masterChefV3ABI from '@/constant/abi/masterChefV3.json'
import { readContracts } from '@wagmi/core'
import { useAccount, useReadContract } from '@wagmi/vue'
import type { Address } from 'viem'
import { computed, ref, watch } from 'vue'
import { config } from '~/config/wagmi'

export function useV3TokenIdsByAccount(contractAddress?: Address) {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()

  const {
    isLoading: balanceLoading,
    data: accountBalance,
    refetch: refetchBalance
  } = useReadContract({
    abi: masterChefV3ABI,
    //@ts-ignore
    address: contractAddress,
    functionName: 'balanceOf',
    args: account.value ? [account.value] : undefined,
    //@ts-ignore
    chainId: chainId.value,
    query: {
      enabled: computed(() => !!account.value && !!contractAddress)
    }
  })

  const tokenIds = ref<bigint[]>([])
  const someTokenIdsLoading = ref(false)

  // Tạo danh sách tokenIdsArgs dựa trên accountBalance
  const tokenIdsArgs = computed(() => {
    if (!accountBalance.value || !account.value) return []
    const balance = Number(accountBalance.value)
    const tokenRequests: {
      abi: typeof masterChefV3ABI
      address: Address
      functionName: 'tokenOfOwnerByIndex'
      args: [Address, number]
      chainId?: number
    }[] = []
    for (let i = 0; i < balance; i++) {
      tokenRequests.push({
        abi: masterChefV3ABI,
        address: contractAddress as `0x${string}`,
        functionName: 'tokenOfOwnerByIndex',
        args: [account.value, i],
        chainId: chainId.value
      })
    }
    return tokenRequests
  })

  // Hàm fetch tokenIds sử dụng readContracts từ @wagmi/core
  const fetchTokenIds = async () => {
    if (!tokenIdsArgs.value.length) {
      tokenIds.value = []
      return
    }

    someTokenIdsLoading.value = true
    try {
      const results = await readContracts(config, {
        //@ts-ignore
        contracts: tokenIdsArgs.value,
        allowFailure: true
      })
      tokenIds.value = results.map((r) => (r.status === 'success' ? r.result : null)).filter(Boolean) as bigint[]
    } catch (error) {
      console.error('Lỗi khi lấy tokenIds:', error)
      tokenIds.value = []
    } finally {
      someTokenIdsLoading.value = false
    }
  }

  // Refetch khi account hoặc tokenIdsArgs thay đổi
  watch(
    [() => account.value, tokenIdsArgs],
    async ([newAccount], [oldAccount]) => {
      if (newAccount && newAccount !== oldAccount) {
        console.log('vao day')

        await refetchBalance({ cancelRefetch: false })
      }
      await fetchTokenIds()
    },
    { immediate: true }
  )

  return {
    tokenIds,
    loading: computed(() => someTokenIdsLoading.value || balanceLoading.value)
  }
}
