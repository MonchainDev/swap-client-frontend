import { useQuery } from '@tanstack/vue-query'
import { defineStore } from 'pinia'
import { DEFAULT_NETWORK, LIST_NETWORK } from '~/config/networks'
import type { INetwork, IToken } from '~/types'
import type { POPUP_NAME } from '~/types/popup.type'

export const useBaseStore = defineStore('base', () => {
  const listToken = ref<IToken[]>([])
  const nativeBalance = ref<string>('0')
  // const currentNetwork = ref<INetwork>({ ...DEFAULT_NETWORK })
  const networkLocated = ref<INetwork>({} as INetwork)

  const breakpoints = useBreakpoints(
    { large: 768 } // Will enable SSR mode and render like if the screen was 768px wide
  )

  const isDesktop = computed(() => {
    return breakpoints.greater('large').value
  })

  const popup = ref<string[]>([])
  const setOpenPopup = (popupName: POPUP_NAME, isOpen = true) => {
    if (isOpen) {
      popup.value = useUnion(popup.value, [popupName])
    } else {
      popup.value = useFilter(popup.value, (value) => {
        return value !== popupName
      })
    }
  }

  const { chainId } = useActiveChainId()

  const currentNetwork = ref<INetwork>(DEFAULT_NETWORK)

  watchEffect(() => {
    console.info('Chain ID has changed', chainId.value)
    const item = LIST_NETWORK.find((item) => item.chainId === chainId.value) || DEFAULT_NETWORK
    currentNetwork.value = item
  })

  useQuery({
    queryKey: computed(() => ['token-list', currentNetwork.value.chainId]),
    queryFn: async () => {
      const { data } = await useFetch<IToken[]>('/api/v2/tokens', { query: { network: currentNetwork.value.network } })
      const tokenList = Array.isArray(data.value)
        ? data.value.map((item) => ({
            ...item,
            logo: '',
            address: item.tokenAddress,
            symbol: item.tokenSymbol,
            decimals: item.tokenDecimals,
            name: item.tokenSymbol
          }))
        : []
      listToken.value = tokenList
      return data.value
    },
    enabled: computed(() => !!currentNetwork.value.chainId)
  })

  return { popup, setOpenPopup, listToken, nativeBalance, isDesktop, currentNetwork, networkLocated, chainId }
})
