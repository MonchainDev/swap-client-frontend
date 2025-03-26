import { useAccount } from '@wagmi/vue'
import { LIST_NETWORK } from '~/config/networks'
// import { ChainId } from '~/types'

export default function useActiveChainId() {
  /**
   * REMEMBER: Params in route has network in case of using network in url such as page detail position, remove liquidity, etc
   * If not, use chainId from account if connected, else use currentNetwork from store
   */
  const { chainId: chain, isConnected } = useAccount()

  const { currentNetwork } = storeToRefs(useBaseStore())
  const route = useRoute()

  const urlIncludeNetwork = computed(() => {
    const paramNetwork = 'network' in route.params ? route.params.network : undefined
    const queryNetwork = 'chain' in route.query ? (route.query.chain as string) : undefined
    return paramNetwork || queryNetwork
  })

  const networkUsed = computed(() => {
    if (isConnected.value) {
      return chain.value
    }
    if (urlIncludeNetwork.value) {
      return LIST_NETWORK.find((network) => network.network === urlIncludeNetwork.value?.toUpperCase())?.chainId
    }
    return currentNetwork.value.chainId
  })

  return { chainId: networkUsed }
}
