import { useQuery } from '@tanstack/vue-query'
import { useAccount, useBalance, useReadContract } from '@wagmi/vue'
import { defineStore } from 'pinia'
import { DEFAULT_NETWORK, LIST_NETWORK } from '~/config/networks'
import { DEFAULT_SLIPPAGE, EMPTY_TOKEN } from '~/constant'
import CONTRACT_SWAP from '~/constant/contract'
import ABI_TOKEN from '~/constant/contract/contract-token.json'
import { type INetwork, type IToken } from '~/types'
import type { IFormBridge } from '~/types/bridge.type'

export const useBridgeStore = defineStore('bridge', () => {
  const listNetwork = ref<INetwork[]>([...LIST_NETWORK])
  const listToken = ref<IToken[]>([])
  const fromNetwork = ref<INetwork>({ ...DEFAULT_NETWORK })
  const toNetwork = ref<INetwork>()

  const slippage = ref<string>(DEFAULT_SLIPPAGE.toString())
  const activeSlippageAuto = ref<boolean>(true)
  const txDeadline = ref<string>('30')
  const isSwapping = ref<boolean>(false)
  const isConfirmApprove = ref<boolean>(false)
  const isConfirmSwap = ref<boolean>(false)
  //   const balance0 = ref<number>(0)

  const { address, chainId } = useAccount()

  const form = ref<IFormBridge>({
    token0: {
      ...EMPTY_TOKEN
    },
    token: {
      ...EMPTY_TOKEN
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

  // get list token from network
  const { data: listTokenFrom } = useQuery({
    queryKey: computed(() => ['token', fromNetwork.value.chainId]),
    queryFn: async () => {
      const query = { network: fromNetwork.value.network, crossChain: 'Y' }
      const data = await $fetch<IToken[]>('/api/network/token', { query })
      return Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            logo: '',
            address: item.tokenAddress,
            symbol: item.tokenSymbol,
            decimals: item.tokenDecimals,
            name: item.tokenSymbol
          }))
        : []
    },
    enabled: computed(() => !!fromNetwork.value.chainId)
  })

  // get list token to network
  const { data: listTokenTo } = useQuery({
    queryKey: computed(() => ['token', toNetwork.value?.chainId]),
    queryFn: async () => {
      const query = { network: toNetwork.value?.network, crossChain: 'Y' }
      const data = await $fetch<IToken[]>('/api/network/token', { query })
      return Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            logo: '',
            address: item.tokenAddress,
            symbol: item.tokenSymbol,
            decimals: item.tokenDecimals,
            name: item.tokenSymbol
          }))
        : []
    },
    enabled: computed(() => !!toNetwork.value?.chainId)
  })

  const token0 = computed(() => {
    return listTokenFrom.value?.find((item) => item.address === form.value.token.address)
  })

  const token1 = computed(() => {
    return listTokenTo.value?.find((item) => item.symbol === form.value.token.symbol)
  })

  const stableDestinationChainIdToken = computed(() => {
    return listTokenTo.value?.find((item) => item.stable)
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract(
    computed(() => ({
      abi: ABI_TOKEN,
      address: token0.value?.tokenAddress as `0x${string}`,
      functionName: 'allowance',
      args: [address.value, CONTRACT_SWAP.v3CoreFactoryAddress]
    }))
  )

  // get from token balance
  const { data: balance0 } = useBalance(
    computed(() => ({
      address: address.value,
      token: (token0.value?.tokenAddress.toLowerCase() === zeroAddress ? '' : token0.value?.tokenAddress) as `0x${string}`,
      watch: true,
      chainId: fromNetwork.value.chainId
    }))
  )

  const resetStore = () => {
    form.value = {
      token0: {
        ...EMPTY_TOKEN
      },
      token: {
        ...EMPTY_TOKEN
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
    stableDestinationChainIdToken,
    slippage,
    balance,
    token0,
    token1,
    allowance,
    txDeadline,
    isSwapping,
    isConfirmApprove,
    isConfirmSwap,
    activeSlippageAuto,
    form,
    refetchAllowance,
    balance0,
    resetStore,
    listTokenFrom,
    listTokenTo
  }
})
