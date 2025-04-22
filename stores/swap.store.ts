import { useQuery } from '@tanstack/vue-query'
import { useAccount, useBalance, useReadContract } from '@wagmi/vue'
import Decimal from 'decimal.js'
import { defineStore } from 'pinia'
import { DEFAULT_SLIPPAGE, EMPTY_TOKEN } from '~/constant'
import ABI_TOKEN from '~/constant/contract/contract-token.json'
import type { IExchangeRate } from '~/types'
import type { IFormSwap } from '~/types/swap.type'

export const useSwapStore = defineStore('swap', () => {
  const slippage = ref<string>(DEFAULT_SLIPPAGE.toString())
  const activeSlippageAuto = ref<boolean>(true)
  const txDeadline = ref<string>('30')
  const isSwapping = ref<boolean>(false)
  const isConfirmApprove = ref<boolean>(false)
  const isConfirmSwap = ref<boolean>(false)

  const { address } = useAccount()
  const { chainId } = useActiveChainId()

  const form = ref<IFormSwap>({
    token0: {
      ...EMPTY_TOKEN
    },
    token1: {
      ...EMPTY_TOKEN
    },
    amountIn: '',
    amountOut: '',
    chainId: chainId.value,
    minimumAmountOut: '',
    maximumAmountIn: '',
    priceImpact: '',
    fee: 0,
    tradingFee: '0'
  })

  const { data: balance0, refetch: refetchBalance0 } = useBalance(
    computed(() => ({
      address: address.value,
      token: (form.value.token0.address?.toLowerCase() === zeroAddress ? '' : form.value.token0.address) as `0x${string}`,
      watch: true
    }))
  )

  const { data: balance1, refetch: refetchBalance1 } = useBalance(
    computed(() => ({
      address: address.value,
      token: (form.value.token1.address?.toLowerCase() === zeroAddress ? '' : form.value.token1.address) as `0x${string}`,
      watch: true
    }))
  )

  // const token0 = computed(() => useCurrency(form.value.token0.address as string, chainId.value!).token.value)

  // const token1 = computed(() => useCurrency(form.value.token1.address as string, chainId.value!).token.value)

  const { currentNetwork } = storeToRefs(useBaseStore())
  /**
   * List token theo network đang thấy sai so với trên contract
   * Nên phải gọi lên contract để lấy thông tin token
   */
  const { data: token0 } = useQuery({
    queryKey: computed(() => ['token0', form.value.token0.address]),
    queryFn: async () => {
      const currency = form.value.token0.address.toLowerCase()
      const { token: native } = useNativeCurrency(currentNetwork.value.chainId)
      const isNative = currency === zeroAddress

      if (isNative) {
        return native.value
      } else {
        const item = await getTokenByChainId(currency, currentNetwork.value.chainId)
        return item
      }
    },
    enabled: computed(() => !!form.value.token0.address)
  })

  const { data: token1 } = useQuery({
    queryKey: computed(() => ['token1', form.value.token1.address]),
    queryFn: async () => {
      const currency = form.value.token1.address.toLowerCase()
      const { token: native } = useNativeCurrency(currentNetwork.value.chainId)
      const isNative = currency === zeroAddress
      if (isNative) {
        return native.value
      } else {
        const item = await getTokenByChainId(currency, currentNetwork.value.chainId)
        return item
      }
    },
    enabled: computed(() => !!form.value.token1.address)
  })

  const swapRouterV3Address = computed(() => getSwapRouterV3Address(chainId.value))

  const { data: allowance1, refetch: refetchAllowance1 } = useReadContract(
    computed(() => ({
      abi: ABI_TOKEN,
      address: token1.value?.wrapped.address,
      functionName: 'allowance',
      args: [address.value, swapRouterV3Address.value],
      chainId: chainId.value
    }))
  )

  const { data: allowance0, refetch: refetchAllowance0 } = useReadContract(
    computed(() => ({
      abi: ABI_TOKEN,
      address: token0.value?.wrapped.address,
      functionName: 'allowance',
      args: [address.value, swapRouterV3Address.value],
      chainId: chainId.value
    }))
  )

  const resetStore = () => {
    form.value = {
      token0: {
        ...EMPTY_TOKEN
      },
      token1: {
        ...EMPTY_TOKEN
      },
      amountIn: '',
      amountOut: '',
      chainId: chainId.value,
      minimumAmountOut: '',
      maximumAmountIn: '',
      priceImpact: '',
      fee: 0,
      tradingFee: '0'
    }
    isConfirmApprove.value = false
    isConfirmSwap.value = false
    isSwapping.value = false
  }

  const fetchExchangeRate = async () => {
    const params = new URLSearchParams()
    if (form.value.token0.address) {
      params.append('currencies', form.value.token0.symbol)
      const data = await $fetch<IExchangeRate[]>(`/api/exchange-rate/all?${params.toString()}`)
      return data
    }
  }

  const { data: exchangeRate } = useQuery({
    queryKey: computed(() => ['exchange-rate-base-token-swap', form.value.token0.address]),
    queryFn: fetchExchangeRate,
    enabled: computed(() => !!form.value.token0.address)
  })

  const exchangeRateBaseCurrency = computed(() => {
    if (exchangeRate.value?.length) {
      const rateList = exchangeRate.value.filter((item) => item.symbol === form.value.token0.symbol)
      if (rateList.length) {
        const isSlug = rateList.some((item) => item.slug === '')
        const rate =
          rateList.length === 1
            ? rateList[0]
            : isSlug
              ? rateList.find((item) => item.slug === '')
              : rateList.find((item) => item.symbol === form.value.token0.symbol)

        return rate ? new Decimal(rate.priceUsd).toSignificantDigits(6).toString() : '0'
      }
      return '0'
    }
    return '0'
  })

  return {
    slippage,
    balance0,
    balance1,
    token0,
    token1,
    allowance0,
    allowance1,
    txDeadline,
    isSwapping,
    isConfirmApprove,
    isConfirmSwap,
    activeSlippageAuto,
    form,
    refetchAllowance0,
    refetchAllowance1,
    resetStore,
    exchangeRateBaseCurrency,
    refetchBalance0,
    refetchBalance1
  }
})
