import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
import { config } from '~/config/wagmi'
import { NonfungiblePositionManager } from '~/utils/nonfungiblePositionManager'

export default function useCollectFee() {
  const loading = ref(false)
  const { showToastMsg } = useShowToastMsg()

  const { chainId } = useActiveChainId()

  const collectFee = async (tokenId: bigint | undefined, collectOptions: Omit<CollectOptions, 'tokenId'>) => {
    try {
      loading.value = true
      const dataEncode = NonfungiblePositionManager.encodeCollect({ ...collectOptions, tokenId: tokenId! })
      const contractAddress = getNftPositionManagerAddress(chainId.value)
      if (!contractAddress) throw new Error('Invalid contract address')

      const txHash = await sendTransaction(config, {
        to: contractAddress,
        data: dataEncode[0],
        account: collectOptions.recipient
      })

      const { status } = await waitForTransactionReceipt(config, {
        hash: txHash,
        pollingInterval: 2000
      })

      if (status === 'success') {
        showToastMsg('Transaction receipt', 'success', getUrlScan(chainId.value, 'tx', txHash))
      } else {
        showToastMsg('Transaction failed', 'error', getUrlScan(chainId.value, 'tx', txHash))
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
