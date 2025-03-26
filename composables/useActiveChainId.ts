import { useAccount } from '@wagmi/vue'
import { LIST_NETWORK } from '~/config/networks'
// import { ChainId } from '~/types'

export default function useActiveChainId() {
  /**
   * REQUIRED: Params in route has network in case of using network in url such as page detail position, remove liquidity, etc
   * If not, use chainId from account
   */
  const { chainId: chain, isConnected } = useAccount()

  const route = useRoute()

  const urlIncludeNetwork = computed(() => ('network' in route.params ? route.params.network : undefined))

  const networkUsed = computed(() => {
    if (isConnected.value) {
      return chain.value
    }
    return LIST_NETWORK.find((network) => network.network === urlIncludeNetwork.value?.toUpperCase())?.chainId
  })

  return { chainId: networkUsed }
}
