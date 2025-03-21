import { Token } from '@monchain/swap-sdk-core'
import { useAccount, useBalance, useReadContract } from '@wagmi/vue'
import { defineStore } from 'pinia'
import { DEFAULT_SLIPPAGE, EMPTY_TOKEN } from '~/constant'
import CONTRACT_SWAP from '~/constant/contract'
import ABI_TOKEN from '~/constant/contract/contract-token.json'
import { type ChainId, type INetwork, type IToken } from '~/types'
import { DEFAULT_NETWORK, LIST_NETWORK } from '~/config/networks'
import type { IFormBridge } from '~/types/bridge.type'
import { useQuery } from "@tanstack/vue-query";

export const useBridgeStore = defineStore('bridge', () => {
    const listNetwork = ref<INetwork[]>([])
    const listToken = ref<IToken[]>([])
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

    const {address, chainId} = useAccount()

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

    const {data: balance, refetch: _refetchBalance} = useBalance(
        computed(() => ({
            address: address.value,
            token: form.value.token.tokenAddress as MaybeRef<`0x${string}`>,
            watch: true
        }))
    )

    useQuery({
        queryKey: computed(() => ['token0', form.value?.token.tokenSymbol]),
        queryFn: async () => {
            const query = {network: fromNetwork.value?.network, crossChain: 'Y'}
            const {data} = await useFetch<IToken[]>('/api/network/token', {query})
            const tokenSymbol = data.value?.find(item => item.tokenSymbol === form.value.token.tokenSymbol)
            console.info('token0', tokenSymbol)
            token0.value = form.value.token.tokenSymbol
                ? new Token(
                    fromNetwork.value?.chainId as ChainId,
                    tokenSymbol?.tokenAddress as `0x${string}`,
                    +tokenSymbol!.tokenDecimals,
                    tokenSymbol!.tokenSymbol!,
                    tokenSymbol?.name
                )
                : undefined

            const { data: bl0 } = useBalance(
                computed(() => ({
                    address: address.value,
                    token: (token0.value?.address?.toLowerCase() === zeroAddress ? '' : token0.value!.address) as `0x${string}`,
                    watch: true
                }))
            )
            console.info('bl0: ', bl0)
            balance0.value = Number(bl0.value!.formatted)
            return token0
        },
        enabled: computed(() => !!form.value?.token.tokenSymbol)
    })

    useQuery({
        queryKey: computed(() => ['token1', form.value?.token.tokenSymbol]),
        queryFn: async () => {
            const query = {network: toNetwork.value?.network, crossChain: 'Y'}
            const {data} = await useFetch<IToken[]>('/api/network/token', {query})
            const tokenSymbol = data.value?.find(item => item.tokenSymbol === form.value.token.tokenSymbol)
            console.info('token1', tokenSymbol)
            token1.value = form.value.token.tokenSymbol
                ? new Token(
                    toNetwork.value?.chainId as ChainId,
                    tokenSymbol?.tokenAddress as `0x${string}`,
                    +tokenSymbol!.tokenDecimals,
                    tokenSymbol!.tokenSymbol,
                    tokenSymbol?.name
                )
                : undefined
            return token1
        },
        enabled: computed(() => !!form.value?.token.tokenSymbol)
    })

    const {data: allowance, refetch: refetchAllowance} = useReadContract(
        computed(() => ({
            abi: ABI_TOKEN,
            address: token0.value?.address,
            functionName: 'allowance',
            args: [address.value, CONTRACT_SWAP.v3CoreFactoryAddress]
        }))
    )

    useQuery({
        queryKey: computed(() => ['token-list', toNetwork.value?.chainId as ChainId]),
        queryFn: async () => {
            const query = {network: toNetwork.value?.network, crossChain: 'Y'}
            const {data} = await useFetch<IToken[]>('/api/network/token', {query})
            listToken.value = Array.isArray(data.value)
                ? data.value.map((item) => ({
                    ...item,
                    logo: '',
                    address: item.tokenAddress,
                    symbol: item.tokenSymbol,
                    decimals: item.tokenDecimals,
                    name: item.tokenSymbol
                }))
                : []
            return data.value
        },
        enabled: computed(() => !!toNetwork.value?.chainId)
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

    listNetwork.value = [...LIST_NETWORK]
    fromNetwork.value = DEFAULT_NETWORK



    return {
        fromNetwork,
        toNetwork,
        listNetwork,
        listToken,
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
        resetStore
    }
})
