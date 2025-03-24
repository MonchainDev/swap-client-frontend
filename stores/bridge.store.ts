import { Token } from '@monchain/swap-sdk-core'
import { useAccount, useBalance, useReadContract, useConfig } from '@wagmi/vue'
import { defineStore } from 'pinia'
import { DEFAULT_SLIPPAGE, EMPTY_TOKEN } from '~/constant'
import CONTRACT_SWAP from '~/constant/contract'
import ABI_TOKEN from '~/constant/contract/contract-token.json'
import { type ChainId, type INetwork, type IToken } from '~/types'
import { DEFAULT_NETWORK, LIST_NETWORK } from '~/config/networks'
import type { IFormBridge } from '~/types/bridge.type'
import { getBalance } from '@wagmi/core'

export const useBridgeStore = defineStore('bridge', () => {
  const listNetwork = ref<INetwork[]>([...LIST_NETWORK])
  const listToken = ref<IToken[]>([])
  const listTokenFrom = ref<IToken[]>([])
  const fromNetwork = ref<INetwork>()
  const toNetwork = ref<INetwork>()
  const token0 = ref<Token>()
  const token1 = ref<Token>()

  const slippage = ref<string>(DEFAULT_SLIPPAGE.toString())
  const activeSlippageAuto = ref<boolean>(true)
  const txDeadline = ref<string>('30')
  const isSwapping = ref<boolean>(false)
  const isConfirmApprove = ref<boolean>(false)
  const isConfirmSwap = ref<boolean>(false)
  const balance0 = ref<number>(0)

  const { address, chainId } = useAccount()
  const { setOpenPopup } = useBaseStore()
  const config = useConfig()

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

  watch(
    () => form.value?.token?.tokenSymbol,
    async (formTokenSymbol) => {
      if (!formTokenSymbol) return
      // Token 0
      const query = { network: fromNetwork.value?.network, crossChain: 'Y' }
      const { data } = await useFetch<IToken[]>('/api/network/token', { query })
      const _token0 = data.value?.find((item) => item.tokenSymbol === formTokenSymbol)
      console.info('token0', _token0)
      token0.value = formTokenSymbol
        ? new Token(
            fromNetwork.value?.chainId as ChainId,
            _token0?.tokenAddress as `0x${string}`,
            +_token0!.tokenDecimals,
            _token0!.tokenSymbol!,
            _token0?.name
          )
        : undefined

      if (!address.value) {
        console.error('Address is required')
        setOpenPopup('popup-connect')
        return
      }
      balance0.value = Number(await getBalanceToken(address.value, token0.value?.address as `0x${string}`))

      console.log('>>> / balance0.value:', balance0.value)

      // Token 1
      const token1Res = await $fetch<IToken[]>('/api/network/token', {
        query: { network: toNetwork.value?.network, crossChain: 'Y' }
      })
      console.log('token1Res', token1Res)
      const _token1 = token1Res?.find((item) => item.tokenSymbol === formTokenSymbol)
      console.info('token1', _token1)
      token1.value = formTokenSymbol
        ? new Token(toNetwork.value?.chainId as ChainId, _token1?.tokenAddress as `0x${string}`, +_token1!.tokenDecimals, _token1!.tokenSymbol, _token1?.name)
        : undefined
    }
  )

  async function getBalanceToken(address: `0x${string}`, token: string) {
    try {
      const _address = address.toLowerCase() as `0x${string}`
      const tokenBalance = await getBalance(config, {
        address: _address,
        token: (token === zeroAddress ? '' : token) as `0x${string}`
      })
      return BigInt(tokenBalance.value)
    } catch (error) {
      console.error('Error get balance', error)
      return BigInt(0)
    }
  }

  const { data: allowance, refetch: refetchAllowance } = useReadContract(
    computed(() => ({
      abi: ABI_TOKEN,
      address: token0.value?.address,
      functionName: 'allowance',
      args: [address.value, CONTRACT_SWAP.v3CoreFactoryAddress]
    }))
  )

  const { data: listTokenRs } = useLazyFetch<IToken[]>('/api/network/token', {
    query: computed(() => ({ network: toNetwork.value?.network, crossChain: 'Y' })),
    onResponse({ response: { _data } }) {
      listToken.value = Array.isArray(_data)
        ? _data.map((item) => ({
            ...item,
            logo: '',
            address: item.tokenAddress,
            symbol: item.tokenSymbol,
            decimals: item.tokenDecimals,
            name: item.tokenSymbol
          }))
        : []
    },
    watch: [() => !!toNetwork.value?.network],
    immediate: false
  })

  const { data: listTokenFromRs } = useLazyFetch<IToken[]>('/api/network/token', {
    query: computed(() => ({ network: fromNetwork.value?.network, crossChain: 'Y' })),
    onResponse({ response: { _data } }) {
      listTokenFrom.value = Array.isArray(_data)
        ? _data.map((item) => ({
            ...item,
            logo: '',
            address: item.tokenAddress,
            symbol: item.tokenSymbol,
            decimals: item.tokenDecimals,
            name: item.tokenSymbol
          }))
        : []
    },
    watch: [() => !!fromNetwork.value?.network],
    immediate: true
  })

  const { data: _listNetworkRs } = useLazyFetch<INetwork[]>('/api/network/all', {
    onResponse({ response: { _data } }) {
      listNetwork.value = _data || []
    }
  })

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
    listTokenFrom,
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
    listTokenRs
  }
})
