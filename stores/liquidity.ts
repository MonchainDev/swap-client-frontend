import { defineStore } from 'pinia'
import { NATIVE_TOKEN } from '~/constant'
import type { IFormCreatePosition } from '~/types/position.type'

export const useLiquidityStore = defineStore('liquidity', () => {
  const stepCurrent = ref(1)
  const form = ref<IFormCreatePosition>({
    feeTier: 0.3,
    token0: {
      ...NATIVE_TOKEN
    },
    token1: {
      address: '',
      decimals: 0,
      icon_url: '',
      name: '',
      symbol: ''
    },
    typeRange: 'FULL',
    minPrice: '0',
    maxPrice: '∞',
    amount: '',
    amountDeposit0: '0',
    amountDeposit1: ''
  })

  return { form, stepCurrent }
})
