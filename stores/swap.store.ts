import { defineStore } from 'pinia'

export const useSwapStore = defineStore('swap', () => {
  const slippage = ref<string>('5.5')
  const activeSlippageAuto = ref<boolean>(true)
  const txDeadline = ref<string>('30')
  const isSwapping = ref<boolean>(false)

  return { slippage, activeSlippageAuto, txDeadline, isSwapping }
})
