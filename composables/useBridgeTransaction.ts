import { computed } from 'vue'
import { useWriteContract } from 'wagmi'
import { parseUnits, zeroAddress, zeroHash } from 'viem'
import ABI_RELAY_FACET from '@/constant/abi/RelayFacet.json'
import { hexZeroPad } from 'ethers/lib/utils'
import type { IFormBridge } from '~/types/bridge.type'

// Define TypeScript types for better safety
interface ResponseData {
  requestId: string
  iterator: string
  signature: string
}

interface BridgeTransactionParams {
  response: ResponseData 
  token: `0x${string}` // Enforce valid Ethereum address type
  receiverAddress: `0x${string}`
  destinationChainId: number
  receiverAssetId: `0x${string}`
  gasEstimate: bigint
  form: IFormBridge
}

export function useBridgeTransaction({
  response,
  token,
  receiverAddress,
  destinationChainId,
  receiverAssetId,
  gasEstimate,
  form,
}: BridgeTransactionParams) {
  const liFiDiamondAddress: `0x${string}` = '0x4797F967C3D77A1949Fb7F429f09072dFdB6de9d'

  // Prepare Bridge Data
  const bridgeData = computed(() => ({
    transactionId: response.requestId,
    bridge: 'relay',
    integrator: response.iterator,
    referrer: zeroAddress,
    sendingAssetId: token,
    receiver: receiverAddress,
    minAmount: parseUnits(form.amount, +form.token.decimals),
    destinationChainId,
    hasSourceSwaps: false,
    hasDestinationCall: false,
  }))

  // Prepare Relay Data
  const relayData = computed(() => ({
    requestId: response.requestId,
    nonEVMReceiver: zeroHash, // Use viem's zeroHash instead of ethers.constants.HashZero
    receivingAssetId: hexZeroPad(receiverAssetId, 32),
    signature: response.signature,
  }))

  // Wagmi contract write hook
  const { data, isPending, isError, error, writeContract } = useWriteContract()

  // Function to execute transaction
  const writeContractTransaction = async () => {
    try {
      const tx = await writeContract({
        address: liFiDiamondAddress,
        abi: ABI_RELAY_FACET,
        functionName: 'startBridgeTokensViaRelay',
        args: [bridgeData.value, relayData.value],
        value: BigInt(Number(form.amount) * 10 ** Number(form.token.decimals)),
        gas: 300000n,
        gasPrice: gasEstimate,
      })

      console.log('Transaction sent:', tx)
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  return {
    writeContractTransaction,
    data,
    isPending,
    isError,
    error,
  }
}