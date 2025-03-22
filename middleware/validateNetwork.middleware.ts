import { useAccount } from '@wagmi/vue'
import { DEFAULT_NETWORK, LIST_NETWORK, NETWORK_SUPPORTED } from '~/config/networks'

export default defineNuxtRouteMiddleware((to) => {
  const { setOpenPopup } = useBaseStore()
  const { networkLocated } = storeToRefs(useBaseStore())
  const { chainId } = useActiveChainId()
  const { isConnected } = useAccount()
  if (import.meta.client && isConnected.value) {
    const networkParam = 'network' in to.params ? to.params.network : undefined
    const chainQuery = 'chain' in to.query ? to.query.chain : undefined
    const network = typeof (networkParam ?? chainQuery) === 'string' ? ((networkParam ?? chainQuery) as string) : undefined
    if (network) {
      const isSupported = NETWORK_SUPPORTED[network.toUpperCase()]
      const isMatched = LIST_NETWORK.some((item) => item.network.toUpperCase() === network.toUpperCase() && item.chainId === chainId.value)
      if (!isSupported || !isMatched) {
        networkLocated.value = LIST_NETWORK.find((item) => item.network.toUpperCase() === network.toUpperCase()) || DEFAULT_NETWORK
        setOpenPopup('popup-wrong-network')
      }
    }
  }
})
