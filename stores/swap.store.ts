import { Token } from '@monchain/swap-sdk-core'
import { useAccount, useBalance, useReadContract } from '@wagmi/vue'
import { defineStore } from 'pinia'
import { DEFAULT_SLIPPAGE, NATIVE_TOKEN } from '~/constant'
import { CONTRACT_ADDRESS } from '~/constant/contract'
import ABI_TOKEN from '~/constant/contract/contract-token.json'
import { ChainId } from '~/types'
import type { IFormSwap } from '~/types/swap.type'

export const useSwapStore = defineStore('swap', () => {
  const slippage = ref<string>(DEFAULT_SLIPPAGE.toString())
  const activeSlippageAuto = ref<boolean>(true)
  const txDeadline = ref<string>('30')
  const isSwapping = ref<boolean>(false)
  const isConfirmApprove = ref<boolean>(false)
  const isConfirmSwap = ref<boolean>(false)

  const { address, chainId } = useAccount()

  const form = ref<IFormSwap>({
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
    amountIn: '',
    amountOut: '',
    chainId: chainId.value,
    minimumAmountOut: '',
    maximumAmountIn: '',
    priceImpact: '',
    fee: 0,
    tradingFee: 0
  })

  const { data: balance0, refetch: _refetchBalance0 } = useBalance(
    computed(() => ({
      address: address.value,
      token: form.value.token0.address as MaybeRef<`0x${string}`>,
      watch: true
    }))
  )

  const { data: balance1, refetch: _refetchBalance1 } = useBalance(
    computed(() => ({
      address: address.value,
      token: form.value.token1.address as MaybeRef<`0x${string}`>,
      watch: true
    }))
  )

  const token0 = computed(() => {
    if (form.value.token0.symbol === NATIVE_TOKEN.symbol || form.value.token0.address === '') {
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

  const token1 = computed(() => {
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

  const { data: allowance1, refetch: refetchAllowance1 } = useReadContract(
    computed(() => ({
      abi: ABI_TOKEN,
      address: token1.value?.wrapped.address,
      functionName: 'allowance',
      args: [address.value, CONTRACT_ADDRESS.SWAP_ROUTER_V3]
    }))
  )

  const { data: allowance0, refetch: refetchAllowance0 } = useReadContract(
    computed(() => ({
      abi: ABI_TOKEN,
      address: token0.value?.wrapped.address,
      functionName: 'allowance',
      args: [address.value, CONTRACT_ADDRESS.SWAP_ROUTER_V3]
    }))
  )

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
    refetchAllowance1
  }
})
