import { defineStore } from 'pinia'
import { DEFAULT_NETWORK } from '~/constant'
import type { INetwork, IToken } from '~/types'
import type { POPUP_NAME } from '~/types/popup.type'

export const useBaseStore = defineStore('base', () => {
  const listToken = ref<IToken[]>([])
  const nativeBalance = ref<string>('0')
  const isDesktop = ref(false)
  const currentNetwork = ref<INetwork>({ ...DEFAULT_NETWORK })

  onMounted(() => {
    nextTick(() => {
      isDesktop.value = window.innerWidth > 768
    })
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
