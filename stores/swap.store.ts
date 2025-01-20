import { defineStore } from 'pinia'

export const useSwapStore = defineStore('swap', () => {
  const slippage = ref<string>('5.5')
  const activeSlippageAuto = ref<boolean>(true)
  const txDeadline = ref<string>('30')

  return { slippage, activeSlippageAuto, txDeadline }
})
