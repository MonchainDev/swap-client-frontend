import ABI_TOKEN from '@/constant/contract/contract-token.json'
import type { Price } from '@monchain/swap-sdk-core'
import { Token } from '@monchain/swap-sdk-core'
import type { Position } from '@monchain/v3-sdk'
import { useQuery } from '@tanstack/vue-query'
import { useAccount, useBalance, useReadContract } from '@wagmi/vue'
import Decimal from 'decimal.js'
import { defineStore } from 'pinia'
import { NATIVE_TOKEN } from '~/constant'
import { LIST_ADDRESS_FEE } from '~/constant/contract'
import { FeeAmount } from '~/constant/fee'
import { ZOOM_LEVELS } from '~/constant/zoom-level'
import { ChainId, CurrencyField, type IExchangeRate, type IToken, type ZoomLevels } from '~/types'
import type { IFormCreatePosition } from '~/types/position.type'

export const useLiquidityStore = defineStore('liquidity', () => {
  const currentStep = ref(2)
  const form = ref<IFormCreatePosition>({
    token0: {
      address: '',
      decimals: 0,
      icon_url: '',
      name: '',
      symbol: ''
    },
    token1: {
      address: '',
      decimals: 0,
      icon_url: '',
      name: '',
      symbol: ''
    },
    minPrice: '',
    maxPrice: '',
    amount: '',
    amountDeposit0: '',
    amountDeposit1: ''
  })
  const buttonRangePercent = ref<number | null>(null)
  const independentField = ref(CurrencyField.CURRENCY_A)
  const startPriceTypedValue = ref('')
  const feeAmount = ref(0)

  const existingPosition = ref<Position | null>(null)

  const leftRangeTypedValue = ref<Price<Token, Token> | boolean | undefined>(undefined)
  const rightRangeTypedValue = ref<Price<Token, Token> | boolean | undefined>(undefined)

  // value of the input field for the current focus input
  const typedValue = ref('')

  // array of Set price range
  const listTokenOfRange = ref<IToken[]>([])

  const zoomLevel = computed(() => {
    return feeAmount.value ? ZOOM_LEVELS[feeAmount.value as FeeAmount] : ZOOM_LEVELS[FeeAmount.LOWEST]
  })

  const baseCurrency = computed(() => {
    if (form.value.token0.symbol === NATIVE_TOKEN.symbol && form.value.token0.address === '') {
      return Native.onChain(ChainId.MON_TESTNET)
    } else {
      return form.value.token0.symbol
        ? new Token(
            ChainId.MON_TESTNET,
            form.value.token0.address as `0x${string}`,
            +form.value.token0.decimals,
            form.value.token0.symbol,
            form.value.token0.name
          )
        : undefined
    }
  })

  const quoteCurrency = computed(() => {
    if (form.value.token1.symbol === NATIVE_TOKEN.symbol && form.value.token1.address === '') {
      return Native.onChain(ChainId.MON_TESTNET)
    } else {
      return form.value.token1.symbol
        ? new Token(
            ChainId.MON_TESTNET,
            form.value.token1.address as `0x${string}`,
            +form.value.token1.decimals,
            form.value.token1.symbol,
            form.value.token1.name
          )
        : undefined
    }
  })

  function switchTokens() {
    ;[form.value.token0, form.value.token1] = [form.value.token1, form.value.token0]
  }

  function dispatchRangeTypedValue(type: 'MIN' | 'MAX' | 'BOTH' | 'INFINITY', currentPrice?: number | undefined, zoomLevel?: ZoomLevels) {
    if (type === 'INFINITY') {
      leftRangeTypedValue.value = true
      rightRangeTypedValue.value = true
      // form.value.minPrice = '0'
      // form.value.maxPrice = '∞'
      return
    }

    // if (!currentPrice) {
    //   // form.value.minPrice = type === 'MIN' ? '' : form.value.minPrice
    //   // form.value.maxPrice = type === 'MAX' ? '' : form.value.maxPrice
    //   leftRangeTypedValue.value = type === 'MIN' ? true : leftRangeTypedValue.value
    //   rightRangeTypedValue.value = type === 'MAX' ? true : rightRangeTypedValue.value
    //   return
    // }

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

  const resetFiled = () => {
    feeAmount.value = 0
    typedValue.value = ''
    leftRangeTypedValue.value = undefined
    rightRangeTypedValue.value = undefined
    startPriceTypedValue.value = ''
    independentField.value = CurrencyField.CURRENCY_A
    buttonRangePercent.value = null
    form.value.amountDeposit0 = ''
    form.value.amountDeposit1 = ''
    form.value.minPrice = ''
    form.value.maxPrice = ''
  }

  const { address } = useAccount()

  const { data: balance0, refetch: refetchBalance0 } = useBalance(
    computed(() => ({
      address: address.value,
      token: form.value.token0.address as MaybeRef<`0x${string}`>,
      watch: true
    }))
  )

  const { data: balance1, refetch: refetchBalance1 } = useBalance(
    computed(() => ({
      address: address.value,
      token: form.value.token1.address as MaybeRef<`0x${string}`>,
      watch: true
    }))
  )

  const { data: allowance0, refetch: refetchAllowance0 } = useReadContract(
    computed(() => ({
      abi: ABI_TOKEN,
      address: baseCurrency.value?.wrapped.address,
      functionName: 'allowance',
      args: [address.value, LIST_ADDRESS_FEE.SPENDER_CREATE_POOL]
    }))
  )

  const { data: allowance1, refetch: refetchAllowance1 } = useReadContract(
    computed(() => ({
      abi: ABI_TOKEN,
      address: quoteCurrency.value?.wrapped.address,
      functionName: 'allowance',
      args: [address.value, LIST_ADDRESS_FEE.SPENDER_CREATE_POOL]
    }))
  )

  const resetStore = () => {
    resetFiled()
    form.value = {
      token0: {
        address: '',
        decimals: 0,
        icon_url: '',
        name: '',
        symbol: ''
      },
      token1: {
        address: '',
        decimals: 0,
        icon_url: '',
        name: '',
        symbol: ''
      },
      minPrice: '',
      maxPrice: '',
      amount: '',
      amountDeposit0: '',
      amountDeposit1: ''
    }
    existingPosition.value = null
    listTokenOfRange.value = []
  }

  const fetchExchangeRate = async () => {
    const params = new URLSearchParams()
    if (baseCurrency.value && quoteCurrency.value) {
      params.append('currencies', baseCurrency.value.symbol)
      params.append('currencies', quoteCurrency.value.symbol)
      const data = await $fetch<IExchangeRate[]>(`/api/exchange-rate/all?${params.toString()}`)
      return data
    }
  }

  const { data: exchangeRate } = useQuery({
    queryKey: computed(() => ['exchangeRate', baseCurrency.value?.symbol, quoteCurrency.value?.symbol]),
    queryFn: fetchExchangeRate,
    enabled: computed(() => !!(baseCurrency.value?.symbol && quoteCurrency.value?.symbol))
  })

  const exchangeRateBaseCurrency = computed(() => {
    if (exchangeRate.value?.length) {
      const rateList = exchangeRate.value.filter((item) => item.symbol === baseCurrency.value?.symbol)
      if (rateList.length) {
        const rate = rateList.length === 1 ? rateList[0] : rateList.find((item) => item.slug === '')
        return rate ? new Decimal(rate.priceUsd).toSignificantDigits(6).toString() : '0'
      }
      return '0'
    }
    return '0'
  })

  const exchangeRateQuoteCurrency = computed(() => {
    if (exchangeRate.value?.length) {
      const rateList = exchangeRate.value.filter((item) => item.symbol === quoteCurrency.value?.symbol)
      if (rateList.length) {
        const rate = rateList.length === 1 ? rateList[0] : rateList.find((item) => item.slug === '')
        return rate ? new Decimal(rate.priceUsd).toSignificantDigits(6).toString() : '0'
      }
      return '0'
    }
    return '0'
  })

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
    dispatchRangeTypedValue,
    resetFiled,
    balance0,
    balance1,
    buttonRangePercent,
    allowance0,
    allowance1,
    refetchAllowance0,
    refetchAllowance1,
    listTokenOfRange,
    refetchBalance0,
    refetchBalance1,
    resetStore,
    zoomLevel,
    existingPosition,
    exchangeRateBaseCurrency,
    exchangeRateQuoteCurrency
  }
})
