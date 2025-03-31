<template>
  <BasePopup name="popup-unstake" width="540" title="Unstaking" @close="inverted = false" @open="handleOpen">
    <div class="px-8 pb-7 sm:px-4">
      <div class="flex items-center justify-between">
        <div class="flex gap-1">
          <span class="font-semibold">{{ position.baseSymbol }}-{{ position.quoteSymbol }}</span>
          <span class="font-semibold text-gray-6">(#{{ position.tokenId }})</span>
        </div>
        <div class="flex gap-2">
          <span class="flex h-9 w-[117px] items-center justify-center gap-1 rounded-lg bg-[#E8FFEB] text-sm text-success sm:w-fit sm:px-2">
            <BaseIcon name="loading" size="16" class="text-success" />
            <span>Farming</span>
          </span>
          <span class="flex h-9 w-[117px] items-center justify-center gap-1 rounded-lg bg-[#E8FFEB] text-sm text-success sm:w-fit sm:px-2">
            <BaseIcon name="tick" size="24" class="text-success" />
            <span>Active</span>
          </span>
        </div>
      </div>
      <div class="mt-[30px] flex flex-col gap-[10px] rounded-lg border border-solid border-gray-4 bg-gray-1 px-6 pb-6 pt-5">
        <div class="flex items-center gap-1">
          <span v-if="inverted">Min {{ invertMin }} / Max {{ invertMax }} of {{ position.baseSymbol }} per {{ position.quoteSymbol }}</span>
          <span v-else>Min {{ min }} / Max {{ max }} of {{ position.quoteSymbol }} per {{ position.baseSymbol }}</span>
          <BaseIcon name="arrow-reverse" size="20" class="cursor-pointer" @click="inverted = !inverted" />
        </div>
        <div class="flex items-center gap-1">
          <span class="font-semibold text-gray-7">~${{ formatNumber(position.priceUdtTotal || 0) }}</span>
          <span>
            ({{ displayTokenReserve(position.quoteQuantity, position.quoteDecimals, position.quoteSymbol) }} /
            {{ displayTokenReserve(position.baseQuantity, position.baseDecimals, position.baseSymbol) }})</span
          >
        </div>
        <div class="flex items-center gap-1">
          <span class="font-semibold">APR</span>
          <BaseIcon name="calculator" size="16" />
          <span class="font-semibold text-success">{{ (position.feeApr || 0).toFixed(2) }}%</span>
        </div>
        <span class="font-semibold">ORB earned: {{ amountOrb }} (${{ formatNumber(amountUsdEarn) }})</span>
        <NuxtLink class="w-full" :to="{ name: 'liquidity-network-tokenId', params: { network: position.network, tokenId: position.tokenId } }">
          <button class="!mt-3 flex h-10 w-full items-center justify-center rounded border border-solid border-gray-3 bg-white font-medium">
            Manage Position
          </button>
        </NuxtLink>
      </div>
      <BaseButton :loading="loadingUnStake" class="mt-6 w-full text-xl font-semibold" size="md" @click="handleUnStake">UNSTAKE</BaseButton>
      <p class="mt-[22px] text-sm text-gray-7">
        Unstake will also automatically harvest any earnings that you haven’t collected yet, and send them to your wallet.
      </p>
    </div>
  </BasePopup>
</template>

<script lang="ts" setup>
  import { readContract, sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import { useAccount } from '@wagmi/vue'
  import Decimal from 'decimal.js'
  import { hexToBigInt } from 'viem'
  import { LIST_NETWORK } from '~/config/networks'
  import { TOKEN_REWARDS } from '~/config/tokens'
  import { config } from '~/config/wagmi'
  import type { ChainId, IExchangeRate } from '~/types'
  import type { IBodyTxCollect } from '~/types/encrypt.type'
  import type { IPosition } from '~/types/position.type'
  import { MasterChefV3 } from '~/utils/masterChefV3'

  interface IProps {
    position?: IPosition
  }

  const props = withDefaults(defineProps<IProps>(), {
    position: undefined
  })

  const emit = defineEmits<{
    reload: []
  }>()

  const inverted = ref(false)

  const min = computed(() => {
    // priceLower*quotedecimals/basedecimals
    if (!props.position) return 0
    const { priceLower, baseDecimals, quoteDecimals } = props.position
    return props.position?.priceLower ? formatNumber(toSignificant((priceLower * quoteDecimals) / baseDecimals)) : 0
  })

  const max = computed(() => {
    if (!props.position) return 0
    const { priceUpper, baseDecimals, quoteDecimals } = props.position
    return priceUpper ? formatNumber(toSignificant((priceUpper * quoteDecimals) / baseDecimals)) : 0
  })

  const invertMin = computed(() => {
    if (!max.value) return 0
    const _max = max.value.replaceAll(',', '')
    return formatNumber(toSignificant(1 / parseFloat(_max)))
  })

  const invertMax = computed(() => {
    if (!min.value) return 0
    const _min = min.value.replaceAll(',', '')
    return formatNumber(toSignificant(1 / parseFloat(_min)))
  })

  const displayTokenReserve = (amount: number, decimals: number, symbol: string) => {
    // = (quoteQtty/10^quotedecimals) TokenA/(baseQtty/10^baseDecimals) TokenB
    return `${formatNumber((amount / Math.pow(10, decimals)).toFixed(2))} ${symbol}`
  }

  const loadingUnStake = ref(false)
  const { address: account } = useAccount()
  const { showToastMsg } = useShowToastMsg()
  const { setOpenPopup } = useBaseStore()
  // const { chainId } = useActiveChainId()

  const chainId = computed(() => {
    return LIST_NETWORK.find((item) => item.network === props.position?.network)?.chainId
  })

  const handleUnStake = async () => {
    try {
      if (props.position) {
        loadingUnStake.value = true

        const { calldata, value } = MasterChefV3.withdrawCallParameters({ to: account.value!, tokenId: BigInt(props.position?.tokenId) })
        const contractAddressMasterChef = getMasterChefV3Address(chainId.value)
        if (!contractAddressMasterChef) throw new Error('Invalid contract address')

        const hash = await sendTransaction(config, {
          to: contractAddressMasterChef,
          data: calldata,
          value: hexToBigInt(value),
          chainId: chainId.value
        })

        console.log('🚀 ~ handleUnStake ~ hash:', hash)

        const { status } = await waitForTransactionReceipt(config, {
          hash,
          pollingInterval: 2000
        })
        if (status === 'success') {
          const { tokenId, network, tokenBase, tokenQuote, poolAddress, pendingReward } = props.position

          const body: IBodyTxCollect = {
            transactionHash: hash,
            tokenId: tokenId,
            network: network,
            fromAddress: account.value!,
            toAddress: contractAddressMasterChef,
            fromToken: tokenBase,
            toToken: tokenQuote,
            poolAddress: poolAddress,
            rewardAmount: pendingReward,
            transactionType: 'UNSTAKE'
          }
          await postTransaction(body)
          setTimeout(() => {
            showToastMsg('Unstaked! Your funds ORB earnings have been sent to your wallet', 'success', getUrlScan(chainId.value, 'tx', hash))
            loadingUnStake.value = false
            emit('reload')
            setOpenPopup('popup-unstake', false)
          }, 4000)
        } else {
          showToastMsg('Transaction failed', 'error', getUrlScan(chainId.value, 'tx', hash))
        }
      }
    } catch (error) {
      loadingUnStake.value = false
      console.error('handleUnStake error', error)
      //@ts-ignore
      const msg = error?.shortMessage || null
      if (msg) {
        showToastMsg(msg, 'error')
      }
    }
  }

  const amountOrb = ref(0)
  async function getPendingMoon() {
    const contractAddressMasterChef = getMasterChefV3Address(chainId.value)

    const amount = (await readContract(config, {
      address: contractAddressMasterChef,
      abi: MasterChefV3.ABI,
      functionName: 'pendingMoon',
      args: [props.position?.tokenId],
      chainId: chainId.value
    })) as bigint
    console.log('🚀 ~ pendingMoon ~ amount:', amount)
    amountOrb.value = Number(amount) || 0
  }

  const exchangeRate = ref('0')

  const fetchExchangeRate = async (): Promise<string> => {
    const params = new URLSearchParams()
    const symbol = TOKEN_REWARDS[chainId.value as ChainId]?.symbol
    if (!symbol) return '0'
    params.append('currencies', symbol)
    const data = await $fetch<IExchangeRate[]>(`/api/exchange-rate/all?${params.toString()}`)
    if (data?.length) {
      const rateList = data.filter((item) => item.symbol.toUpperCase() === symbol.toUpperCase())
      if (rateList.length) {
        const rate = rateList.length === 1 ? rateList[0] : rateList.find((item) => item.slug === '')
        return rate ? new Decimal(rate.priceUsd).toSignificantDigits(6).toString() : '0'
      }
      return '0'
    }
    return '0'
  }

  const amountUsdEarn = computed(() => {
    return new Decimal(amountOrb.value).mul(exchangeRate.value).toSignificantDigits(6).toString()
  })

  const handleOpen = async () => {
    getPendingMoon()
    exchangeRate.value = await fetchExchangeRate()
  }
</script>

<style lang="scss" scoped></style>
