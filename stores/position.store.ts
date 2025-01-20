import { defineStore } from 'pinia'
import { NATIVE_TOKEN } from '~/constant'
import type { IFormCreatePosition } from '~/types/position.type'

export const usePositionStore = defineStore('position', () => {
  const stepCurrent = ref(1)
  const form = ref<IFormCreatePosition>({
    feeTier: 0.3,
    token0: {
      ...NATIVE_TOKEN
    },
    token1: {
      name: '',
      symbol: '',
      decimals: 0,
      icon_url: '',
      address: ''
    },
    typeRange: 'FULL',
    minPrice: '0',
    maxPrice: '∞',
    amount: '',
    amountDeposit0: '',
    amountDeposit1: ''
  })

  return { form, stepCurrent }
})
