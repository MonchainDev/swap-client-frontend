import type { Abi, Address } from 'viem'

type UseContractOptions = {
  chainId?: number
}

// returns null on errors
export default function useContract<TAbi extends Abi>(
  addressOrAddressMap?: Address | { [chainId: number]: Address },
  abi?: TAbi,
  options?: UseContractOptions
) {
  const { chainId: currentChainId } = useActiveChainId()
  const chainId = options?.chainId || currentChainId.value

  const contract = computed(() => {
    if (!addressOrAddressMap || !abi || !chainId) return null
    let address: Address | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract({
        abi,
        address,
        chainId,
        signer: undefined
      })
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  })

  return { contract }
}
