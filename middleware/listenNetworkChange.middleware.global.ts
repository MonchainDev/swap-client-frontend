import { DEFAULT_NETWORK, LIST_NETWORK } from '~/config/networks'

export default defineNuxtRouteMiddleware(() => {
  const { currentNetwork } = storeToRefs(useBaseStore())

  const { chainId } = useActiveChainId()
  const { setDefaultToken } = useSwapStore()

  watchEffect(() => {
    console.info('Chain ID has changed', chainId.value)
    const item = LIST_NETWORK.find((item) => item.chainId === chainId.value) || DEFAULT_NETWORK
    currentNetwork.value = item

    if (import.meta.client) {
      setDefaultToken(item.chainId, item.network)
    }
  })
})
