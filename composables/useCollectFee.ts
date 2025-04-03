import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
import { hexToBigInt } from 'viem'
import { config } from '~/config/wagmi'
import { MasterChefV3 } from '~/utils/masterChefV3'
import { NonfungiblePositionManager } from '~/utils/nonfungiblePositionManager'

export default function useCollectFee() {
  const loading = ref(false)
  const { showToastMsg } = useShowToastMsg()

  const { chainId } = useActiveChainId()

  const collectFee = async (tokenId: bigint | undefined, collectOptions: Omit<CollectOptions, 'tokenId'>, isStakeMV3: boolean) => {
    try {
      loading.value = true

      const interfaceManager = isStakeMV3 ? MasterChefV3 : NonfungiblePositionManager
      const addressTo = isStakeMV3 ? getMasterChefV3Address(chainId.value) : getNftPositionManagerAddress(chainId.value)

      const { calldata, value } = interfaceManager.collectCallParameters({ ...collectOptions, tokenId: tokenId! })

      if (!addressTo) throw new Error('Invalid contract address')

      const txHash = await sendTransaction(config, {
        to: addressTo,
        data: calldata,
        account: collectOptions.recipient,
        value: hexToBigInt(value),
        chainId: chainId.value
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
