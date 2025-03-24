import { useAccount } from '@wagmi/vue'
// import { ChainId } from '~/types'

export default function useActiveChainId() {
  const { chainId } = useAccount()

  // const defaultChainId = computed(() => ChainId.MON_TESTNET)

  return { chainId }
}
