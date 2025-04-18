import { Token } from '@monchain/swap-sdk-core'
import { getBalance } from '@wagmi/core'
import { useAccount, useBalance, useConfig, useReadContract, useSwitchChain } from '@wagmi/vue'
import { defineStore } from 'pinia'
import { LIST_NETWORK } from '~/config/networks'
import { DEFAULT_SLIPPAGE, EMPTY_TOKEN } from '~/constant'
import CONTRACT_SWAP from '~/constant/contract'
import ABI_TOKEN from '~/constant/contract/contract-token.json'
import { type ChainId, type INetwork, type IToken } from '~/types'
import type { IFormBridge } from '~/types/bridge.type'
import Decimal from 'decimal.js'

export const useBridgeStore = defineStore('bridge', () => {
  const listNetwork = ref<INetwork[]>([...LIST_NETWORK])
  const listToken = ref<IToken[]>([])
  const listTokenFrom = ref<IToken[]>([])
  const fromNetwork = ref<INetwork>(LIST_NETWORK[0])
  const toNetwork = ref<INetwork>(LIST_NETWORK[1])
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
  const fee = reactive({
    network: '0', // value native token
    networkSymbol: '', // symbol native token
    networkDecimals: 18,
    protocol: '0', // fee usdt (stable ở mạng đích)
    protocolSymbol: '', // symbol usdt (stable ở mạng đích)
    feeProtocolToken: '', // address token fee
    bridge: '0', //  fee tier (orb)
    bridgeSymbol: '' // symbol orb
  })
  const { switchChain } = useSwitchChain()

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
      console.log(formTokenSymbol)
      // Token 0
      form.value.amount = ''
      const query = { network: fromNetwork.value?.network, crossChain: 'Y' }
      const data = await $fetch<IToken[]>('/api/network/token', { query })
      const _token0 = data?.find((item) => item.tokenSymbol === formTokenSymbol)
      console.info('store-token0', _token0)
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
        window.location.reload()
        setOpenPopup('popup-connect')
        return
      }
      if (token0.value) {
        const _balance = Number(await getBalanceToken(address.value, token0.value.address as `0x${string}`))
        console.info(' ~ bridge.store.ts:95 ~ _balance:', _balance)
        balance0.value = Decimal(_balance)
          .div(10 ** token0.value.decimals)
          .toNumber()
        console.info(' ~ bridge.store.ts:99 ~ balance0:', balance0.value)
      } else {
        balance0.value = 0
      }
      // Token 1
      const token1Res = await $fetch<IToken[]>('/api/network/token', {
        query: { network: toNetwork.value?.network, crossChain: 'Y' }
      })
      console.log('token1Res', token1Res)
      const _token1 = token1Res?.find((item) => item.tokenSymbol === formTokenSymbol)
      console.info('token1', _token1)
      if (_token1) {
        token1.value = formTokenSymbol
          ? new Token(toNetwork.value?.chainId as ChainId, _token1?.tokenAddress as `0x${string}`, +_token1!.tokenDecimals, _token1!.tokenSymbol, _token1?.name)
          : undefined
      }
    }, { immediate: true, deep: true }
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

  const { data: _listTokenFromRs } = useLazyFetch<IToken[]>('/api/network/token', {
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
      if (!fromNetwork.value) return
      ElMessage.success(`Switch to ${fromNetwork.value.network}`)
      switchChain({ chainId: fromNetwork.value.chainId })
    },
    watch: [() => !!fromNetwork.value?.network],
    immediate: true
  })

  const { data: _listNetworkRs } = useFetch<INetwork[]>('/api/network/all', {
    onResponse({ response: { _data } }) {
      listNetwork.value = _data || []
      const networkFrom = listNetwork.value.find((item) => item.network === 'MON')
      const networkTo = listNetwork.value.find((item) => item.network === 'BSC')
      if (networkFrom) {
        fromNetwork.value = { ...networkFrom, logo: '/logo-mon-chain.png' }
      }
      if (networkTo) {
        toNetwork.value = { ...networkTo, logo: '/logo-bnb-chain.png' }
      }
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
    fee.bridge = '0'
    fee.protocol = '0'
    fee.network = '0'
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
    listTokenRs,
    fee
  }
})
