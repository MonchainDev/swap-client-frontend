import { NonfungiblePositionManager } from '~/utils/nonfungiblePositionManager'
import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
import { config } from '~/config/wagmi'
import { CONTRACT_ADDRESS } from '~/constant/contract'

export default function useCollectFee() {
  const loading = ref(false)
  const { showToastMsg } = useShowToastMsg()

  const collectFee = async (tokenId: bigint | undefined, collectOptions: Omit<CollectOptions, 'tokenId'>) => {
    try {
      loading.value = true
      const dataEncode = NonfungiblePositionManager.encodeCollect({ ...collectOptions, tokenId: tokenId! })

      const txHash = await sendTransaction(config, {
        to: CONTRACT_ADDRESS.NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
        data: dataEncode[0],
        account: collectOptions.recipient
      })

      const { status } = await waitForTransactionReceipt(config, {
        hash: txHash,
        pollingInterval: 2000
      })

      if (status === 'success') {
        showToastMsg('Transaction receipt', 'success', txHash)
      } else {
        showToastMsg('Transaction failed', 'error', txHash)
      }
    } catch (error) {
      console.error(error)
      showToastMsg('Transaction failed', 'error')
    } finally {
      loading.value = false
    }
  }

  return { collectFee, loading }
}
