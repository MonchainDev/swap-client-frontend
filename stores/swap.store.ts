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
    tradingFee: 0
  })

  const { data: balance0 } = useBalance(
    computed(() => ({
      address: address.value,
      token: (form.value.token0.address?.toLowerCase() === zeroAddress ? '' : form.value.token0.address) as `0x${string}`,
      watch: true
    }))
  )

  const { data: balance1 } = useBalance(
    computed(() => ({
      address: address.value,
      token: (form.value.token1.address?.toLowerCase() === zeroAddress ? '' : form.value.token1.address) as `0x${string}`,
      watch: true
    }))
  )

  const token0 = computed(() => useCurrency(form.value.token0.address as string, chainId.value!).token.value)

  const token1 = computed(() => useCurrency(form.value.token1.address as string, chainId.value!).token.value)

  const swapRouterV3Address = computed(() => getSwapRouterV3Address(chainId.value))

  const { data: allowance1, refetch: refetchAllowance1 } = useReadContract(
    computed(() => ({
      abi: ABI_TOKEN,
      address: token1.value?.wrapped.address,
      functionName: 'allowance',
      args: [address.value, swapRouterV3Address.value]
    }))
  )

  const { data: allowance0, refetch: refetchAllowance0 } = useReadContract(
    computed(() => ({
      abi: ABI_TOKEN,
      address: token0.value?.wrapped.address,
      functionName: 'allowance',
      args: [address.value, swapRouterV3Address.value]
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
      tradingFee: 0
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
        const rate = rateList.length === 1 ? rateList[0] : rateList.find((item) => item.slug === '')
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
    exchangeRateBaseCurrency
  }
})
