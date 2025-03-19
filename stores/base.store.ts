import { defineStore } from 'pinia'
import { DEFAULT_NETWORK } from '~/config/networks'
import type { INetwork, IToken } from '~/types'
import type { POPUP_NAME } from '~/types/popup.type'

export const useBaseStore = defineStore('base', () => {
  const listToken = ref<IToken[]>([])
  const nativeBalance = ref<string>('0')
  const currentNetwork = ref<INetwork>({ ...DEFAULT_NETWORK })

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

  return { popup, setOpenPopup, listToken, nativeBalance, isDesktop, currentNetwork }
})
