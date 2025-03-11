import { Token } from '@monchain/swap-sdk-core'
import { useAccount, useBalance, useReadContract } from '@wagmi/vue'
import { defineStore } from 'pinia'
import { DEFAULT_SLIPPAGE, NATIVE_TOKEN, DEFAULT_NETWORK } from '~/constant'
import { CONTRACT_ADDRESS } from '~/constant/contract'
import ABI_TOKEN from '~/constant/contract/contract-token.json'
import { ChainId } from '~/types'
import type { IFormBridge } from '~/types/bridge.type'
import type { INetwork } from '~/types'

export const useBridgeStore = defineStore('bridge', () => {
  const fromNetwork = ref<INetwork>({ ...DEFAULT_NETWORK })
  const toNetwork = ref<INetwork>({ ...DEFAULT_NETWORK })

  const slippage = ref<string>(DEFAULT_SLIPPAGE.toString())
  const activeSlippageAuto = ref<boolean>(true)
  const txDeadline = ref<string>('30')
  const isSwapping = ref<boolean>(false)
  const isConfirmApprove = ref<boolean>(false)
  const isConfirmSwap = ref<boolean>(false)

  const { address, chainId } = useAccount()

  const form = ref<IFormBridge>({
    token: {
      address: '',
      decimals: 0,
      icon_url: '',
      name: '',
      symbol: ''
    },
    amount: '',
    chainId: chainId.value,
    priceImpact: '',
    fee: 0,
    tradingFee: 0
  })

  const { data: balance, refetch: _refetchBalance } = useBalance(
    computed(() => ({
      address: address.value,
      token: form.value.token.address as MaybeRef<`0x${string}`>,
      watch: true
    }))
  )

  const token = computed(() => {
    if (form.value.token.symbol === NATIVE_TOKEN.symbol && form.value.token.address === '') {
      return Native.onChain(ChainId.MON_TESTNET)
    } else {
      return form.value.token.symbol
        ? new Token(
            ChainId.MON_TESTNET,
            form.value.token.address as `0x${string}`,
            +form.value.token.decimals,
            form.value.token.symbol,
            form.value.token.name
          )
        : undefined
    }
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract(
    computed(() => ({
      abi: ABI_TOKEN,
      address: token.value?.wrapped.address,
      functionName: 'allowance',
      args: [address.value, CONTRACT_ADDRESS.SWAP_ROUTER_V3]
    }))
  )

  const resetStore = () => {
    form.value = {
      token: {
        address: '',
        decimals: 0,
        icon_url: '',
        name: '',
        symbol: ''
      },
      amount: '',
      chainId: chainId.value,
      priceImpact: '',
      fee: 0,
      tradingFee: 0
    }
    isConfirmApprove.value = false
    isConfirmSwap.value = false
    isSwapping.value = false
  }

  return {
    fromNetwork,
    toNetwork,
    slippage,
    balance,
    token,
    allowance,
    txDeadline,
    isSwapping,
    isConfirmApprove,
    isConfirmSwap,
    activeSlippageAuto,
    form,
    refetchAllowance,
    resetStore
  }
})
