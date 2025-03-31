import CONTRACT_TOKEN from '@/constant/contract/contract-token.json'
import { useWriteContract, useWaitForTransactionReceipt } from '@wagmi/vue'
import { MAX_NUMBER_APPROVE } from '~/constant'
import type { TYPE_STATUS } from '~/types'

export function useApproveToken() {
  const { writeContract, isPending, data: hash, isError } = useWriteContract()
  const callback = ref<(status: TYPE_STATUS) => void>()
  const { isConfirmApprove } = storeToRefs(useSwapStore())

  const { showToastMsg } = useShowToastMsg()

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: hash
  })

  watch(isSuccess, () => {
    if (isSuccess.value && callback.value) {
      callback.value('SUCCESS')
      showToastMsg('Approve successfully', 'success')
    }
  })

  watch(isError, () => {
    if (isError.value && callback.value) {
      console.error('Approval error:', isError.value)
      isConfirmApprove.value = false
      callback.value('FAILED')
      showToastMsg('Approve failed', 'error')
    }
  })

  const approveToken = async (tokenAddress: string, spenderAddress: string, amount = MAX_NUMBER_APPROVE, cb?: (status: TYPE_STATUS) => void) => {
    console.info(' (useApproveToken.ts:31) amount', amount)
    try {
      // Step 1: Trigger transaction (writeContract doesn't return a Promise)
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: CONTRACT_TOKEN,
        functionName: 'approve',
        args: [spenderAddress, amount]
      })
      if (cb) {
        callback.value = cb
      }
    } catch (err) {
      console.error('Approval error:', err)
      return Promise.reject(err)
    }
  }

  return {
    approveToken,
    isPending,
    hash,
    isConfirming,
    isSuccess
  }
}
