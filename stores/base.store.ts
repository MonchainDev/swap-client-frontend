import { defineStore } from 'pinia'
import type { IToken } from '~/types'
import type { POPUP_NAME } from '~/types/popup.type'

export const useBaseStore = defineStore('base', () => {
  const listToken = ref<IToken[]>([])
  const nativeBalance = ref<string>('0')

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

  return { popup, setOpenPopup, listToken, nativeBalance }
})
