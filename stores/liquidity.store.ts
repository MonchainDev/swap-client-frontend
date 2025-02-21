import { defineStore } from 'pinia'
import { NATIVE_TOKEN } from '~/constant'
import type { IFormCreatePosition } from '~/types/position.type'

export const useLiquidityStore = defineStore('liquidity', () => {
  const currentStep = ref(2)
  const form = ref<IFormCreatePosition>({
    feeTier: 0.3,
    token0: {
      ...NATIVE_TOKEN
    },
    // token1: {
    //   address: '',
    //   decimals: 0,
    //   icon_url: '',
    //   name: '',
    //   symbol: ''
    // },
    token1: {
      address: '0x2E151A5CA0ea0373e983Fa9EB28eC98c058C8f34',
      decimals: '18',
      holders: '1',
      icon_url: '',
      name: 'DAVE TOKEN',
      symbol: 'DAVE',
      type: 'ERC-20'
    },
    typeRange: 'FULL',
    minPrice: '0',
    maxPrice: '∞',
    amount: '',
    amountDeposit0: '',
    amountDeposit1: ''
  })

  return { form, currentStep }
})
