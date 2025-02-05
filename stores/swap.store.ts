import { defineStore } from 'pinia'
import { DEFAULT_SLIPPAGE } from '~/constant'
import type { INetwork } from '~/types'

export const useSwapStore = defineStore('swap', () => {
  const slippage = ref<string>(DEFAULT_SLIPPAGE.toString())
  const activeSlippageAuto = ref<boolean>(true)
  const txDeadline = ref<string>('30')
  const isSwapping = ref<boolean>(false)

  const networkSelected = ref<INetwork>({
    title: 'Mon chain',
    logo: '/logo-mon-chain.png',
    value: 'MON'
  })

  return { slippage, activeSlippageAuto, txDeadline, isSwapping, networkSelected }
})
