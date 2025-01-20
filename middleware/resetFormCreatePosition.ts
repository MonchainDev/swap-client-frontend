import { NATIVE_TOKEN } from '~/constant'

export default defineNuxtRouteMiddleware(() => {
  const { form, stepCurrent } = storeToRefs(usePositionStore())
  stepCurrent.value = 1
  form.value = {
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
  }
})
