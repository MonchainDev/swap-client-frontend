import { defineStore } from 'pinia'
import { DEFAULT_SLIPPAGE } from '~/constant'

export const useSwapStore = defineStore('swap', () => {
  const slippage = ref<string>(DEFAULT_SLIPPAGE.toString())
  const activeSlippageAuto = ref<boolean>(true)
  const txDeadline = ref<string>('30')
  const isSwapping = ref<boolean>(false)
  const isConfirmApprove = ref<boolean>(false)
  const isConfirmSwap = ref<boolean>(false)

  return { slippage, activeSlippageAuto, txDeadline, isSwapping, isConfirmApprove, isConfirmSwap }
})
