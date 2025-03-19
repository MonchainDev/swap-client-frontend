import { Token } from '@monchain/swap-sdk-core'
import { useAccount, useBalance, useReadContract } from '@wagmi/vue'
import { defineStore } from 'pinia'
import { DEFAULT_SLIPPAGE, NATIVE_TOKEN } from '~/constant'
import { CONTRACT_ADDRESS } from '~/constant/contract'
import ABI_TOKEN from '~/constant/contract/contract-token.json'
import { ChainId } from '~/types'
import type { IFormBridge, NetworkConfig, TokenConfig } from '~/types/bridge.type'

export const useBridgeStore = defineStore('bridge', () => {
  const listNetwork = ref<NetworkConfig[]>([])
  const listToken = ref<TokenConfig[]>([])
  const fromNetwork = ref<NetworkConfig>()
  const toNetwork = ref<NetworkConfig>()

  const slippage = ref<string>(DEFAULT_SLIPPAGE.toString())
  const activeSlippageAuto = ref<boolean>(true)
  const txDeadline = ref<string>('30')
  const isSwapping = ref<boolean>(false)
  const isConfirmApprove = ref<boolean>(false)
  const isConfirmSwap = ref<boolean>(false)

  const { address, chainId } = useAccount()

  const form = ref<IFormBridge>({
    token: {
      id: 0,
      tokenAddress: '',
      tokenDecimals: 0,
      network: '',
      tokenSymbol: '',
      chainId: 0,
      stable: false,
      crossChain: false,
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
      token: form.value.token.tokenAddress as MaybeRef<`0x${string}`>,
      watch: true
    }))
  )

  const token = computed(() => {
    if (form.value.token.tokenSymbol === NATIVE_TOKEN.symbol && form.value.token.tokenAddress === '') {
      return Native.onChain(ChainId.MON_TESTNET)
    } else {
      return form.value.token.tokenSymbol
        ? new Token(
            ChainId.MON_TESTNET,
            form.value.token.tokenAddress as `0x${string}`,
            +form.value.token.tokenDecimals,
            form.value.token.tokenSymbol,
            form.value.token.network
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
        id: 0,
        tokenAddress: '',
        tokenDecimals: 0,
        network: '',
        tokenSymbol: '',
        chainId: 0,
        stable: false,
        crossChain: false,
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
    listNetwork,
    listToken,
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
