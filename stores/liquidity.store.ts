import type { Price } from '@pancakeswap/swap-sdk-core'
import { Token } from '@pancakeswap/swap-sdk-core'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { defineStore } from 'pinia'
import { NATIVE_TOKEN } from '~/constant'
import { ChainId, type ZoomLevels } from '~/types'
import type { IFormCreatePosition } from '~/types/position.type'

export const useLiquidityStore = defineStore('liquidity', () => {
  const { listToken } = storeToRefs(useBaseStore())
  const currentStep = ref(2)
  const form = ref<IFormCreatePosition>({
    feeTier: 0.3,
    token0: {
      ...listToken.value[0]
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
    amountDeposit0: '',
    amountDeposit1: ''
  })
  const independentField = ref(CurrencyField.CURRENCY_A)
  const startPriceTypedValue = ref('')
  const feeAmount = ref(FeeAmount.MEDIUM)

  const leftRangeTypedValue = ref<Price<Token, Token> | boolean | undefined>(undefined)
  const rightRangeTypedValue = ref<Price<Token, Token> | boolean | undefined>(undefined)

  // value of the input field for the current focus input
  const typedValue = ref('')

  const baseCurrency = computed(() => {
    if (form.value.token0.symbol === NATIVE_TOKEN.symbol || form.value.token0.address === '') {
      return Native.onChain(ChainId.MON_TESTNET)
    } else {
      return new Token(
        ChainId.MON_TESTNET,
        form.value.token0.address as `0x${string}`,
        +form.value.token0.decimals,
        form.value.token0.symbol,
        form.value.token0.name
      )
    }
  })

  const quoteCurrency = computed(() => {
    if (form.value.token1.symbol === NATIVE_TOKEN.symbol || form.value.token1.address === '') {
      return Native.onChain(ChainId.MON_TESTNET)
    } else {
      return new Token(
        ChainId.MON_TESTNET,
        form.value.token1.address as `0x${string}`,
        +form.value.token1.decimals,
        form.value.token1.symbol,
        form.value.token1.name
      )
    }
  })

  function switchTokens() {
    ;[form.value.token0, form.value.token1] = [form.value.token1, form.value.token0]
  }

  function dispatchRangeTypedValue(type: 'MIN' | 'MAX' | 'BOTH' | 'INFINITY', currentPrice?: number | undefined, zoomLevel?: ZoomLevels) {
    if (type === 'INFINITY') {
      leftRangeTypedValue.value = true
      rightRangeTypedValue.value = true
      return
    }

    const left = tryParsePrice(baseCurrency.value?.wrapped, quoteCurrency.value?.wrapped, (currentPrice! * (zoomLevel ? zoomLevel!.initialMin : 1)).toString())
    const right = tryParsePrice(baseCurrency.value?.wrapped, quoteCurrency.value?.wrapped, (currentPrice! * (zoomLevel ? zoomLevel!.initialMax : 1)).toString())
    if (type === 'BOTH') {
      leftRangeTypedValue.value = left
      rightRangeTypedValue.value = right
    } else {
      if (type === 'MIN') {
        leftRangeTypedValue.value = left
      }
      if (type === 'MAX') {
        rightRangeTypedValue.value = right
      }
    }
  }

  return {
    form,
    currentStep,
    independentField,
    baseCurrency,
    quoteCurrency,
    startPriceTypedValue,
    feeAmount,
    typedValue,
    leftRangeTypedValue,
    rightRangeTypedValue,
    switchTokens,
    dispatchRangeTypedValue
  }
})
