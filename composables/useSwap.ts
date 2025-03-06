import ROUTER_V3_ABI from '@/constant/abi/swapRouter.json'
import type { TradeType } from '@monchain/sdk'
import { SwapRouter, type SmartRouterTrade, type SwapOptions } from '@monchain/smart-router'
import { useWriteContract, useWaitForTransactionReceipt } from '@wagmi/vue'
import { hexToBigInt } from 'viem'
import { sendTransaction, waitForTransactionReceipt } from 'viem/actions'
import { config } from '~/config/wagmi'
import { CONTRACT_ADDRESS } from '~/constant/contract'
import type { TYPE_STATUS } from '~/types'

export function useExactInputSingle() {
  console.log('vao day')

  const { writeContract, isPending, data: hash, isError } = useWriteContract()
  const callback = ref<(status: TYPE_STATUS) => void>()
  const { isSwapping } = storeToRefs(useSwapStore())

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: hash
  })

  watch(isSuccess, () => {
    if (isSuccess.value && callback.value) {
      callback.value('SUCCESS')
    }
  })

  watch(isError, () => {
    if (isError.value && callback.value) {
      console.error('Approval error:', isError.value)
      isSwapping.value = false
      callback.value('FAILED')
    }
  })

  const exactInputSingle = async (
    {
      tokenIn,
      tokenOut,
      fee,
      recipient,
      deadline,
      amountIn,
      amountOutMin,
      priceLimit
    }: {
      tokenIn: string
      tokenOut: string
      fee: number
      recipient: string
      deadline: number
      amountIn: bigint
      amountOutMin: bigint
      priceLimit: bigint
    },
    cb?: (status: TYPE_STATUS) => void
  ) => {
    try {
      console.log('🚀 ~ exactInputSingle', [tokenIn, tokenOut, fee, recipient, deadline, amountIn, amountOutMin, priceLimit])

      // Step 1: Trigger transaction (writeContract doesn't return a Promise)
      isSwapping.value = true
      writeContract({
        address: CONTRACT_ADDRESS.SWAP_ROUTER_V3 as `0x${string}`,
        abi: ROUTER_V3_ABI,
        functionName: 'exactInputSingle',
        args: [tokenIn, tokenOut, fee, recipient, deadline, amountIn, amountOutMin, priceLimit]
      })
      if (cb) {
        callback.value = cb
      }
    } catch (err) {
      console.error('Approval error:', err)
      isSwapping.value = false
      return Promise.reject(err)
    }
  }

  return {
    isPending,
    hash,
    isConfirming,
    isSuccess,
    exactInputSingle
  }
}

//
export const useExactInputMulticall = async (trades: SmartRouterTrade<TradeType> | SmartRouterTrade<TradeType>[], options: SwapOptions) => {
    const { calldata, value } = SwapRouter.swapCallParameters(trades, options)

    console.log('🚀 ~ handleCreatePool ~ value:', value)
    console.log('🚀 ~ handleCreatePool ~ calldata:', calldata)

    const txHash = await sendTransaction(config, {
        to: CONTRACT_ADDRESS.SWAP_ROUTER_V3 as `0x${string}`,
        data: calldata,
        value: hexToBigInt(value)
    })
    console.log('🚀 ~ handleCreatePool ~ txHash:', txHash)

    const { status } = await waitForTransactionReceipt(config, {
        hash: txHash,

        pollingInterval: 2000
    })

    if (status === 'success') {

      const { showToastMsg } = useShowToastMsg()
      showToastMsg('Swap successful', 'success', txHash)
        console.info('Transaction successful', 'success', txHash)
    } else {
        ElMessage.error('Transaction failed')
        console.info('Transaction failed', 'error', txHash)
    }

}
