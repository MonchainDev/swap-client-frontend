import { DEFAULT_NETWORK, LIST_NETWORK, NETWORK_SUPPORTED } from '~/config/networks'

export default defineNuxtRouteMiddleware((to) => {
  const { setOpenPopup } = useBaseStore()
  const { networkLocated } = storeToRefs(useBaseStore())
  const { chainId } = useActiveChainId()
  if (import.meta.client) {
    const network = 'network' in to.params ? to.params.network : undefined
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
