<template>
  <div
    class="grid cursor-pointer grid-cols-[4fr,80px,136px,3fr,3fr,180px] border-b border-solid border-gray-2 py-6 hover:bg-gray-2"
    @click="router.push({ name: 'liquidity-network-tokenId', params: { network: props.position.network, tokenId: props.position.tokenId } })"
  >
    <div class="flex items-center gap-[10px] pl-6">
      <div class="flex">
        <img src="/token-default.png" alt="token" class="size-9 rounded-full border border-solid border-white" />
        <img src="/token-default.png" alt="token" class="-ml-4 size-9 rounded-full border border-solid border-white" />
      </div>
      <div class="flex flex-col">
        <div class="line-clamp-1 text-base font-semibold">{{ props.position?.baseSymbol }}/{{ props.position.quoteSymbol }}</div>
        <div class="flex items-center space-x-1">
          <img :src="networkSelected?.logo" :alt="networkSelected?.title" class="size-[14px]" />
          <span class="text-xs text-gray-8">{{ networkSelected?.title }} | #{{ props.position.tokenId }}</span>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center">
      <span class="rounded bg-gray-2 px-2 py-1 text-sm">{{ fee }}</span>
    </div>
    <div class="flex flex-col items-center justify-center gap-1 px-1 text-sm">
      <div class="break-all font-semibold text-success">{{ (props.position.feeApr || 0).toFixed(2) }}%</div>
      <div class="text-gray-6">{{ props.position.rewardApr }}%</div>
    </div>
    <div class="flex flex-col justify-center text-sm">
      <span>Min: {{ min }} {{ props.position.baseSymbol }}/{{ props.position.quoteSymbol }}</span>
      <span>Max: {{ max }} {{ props.position.baseSymbol }}/{{ props.position.quoteSymbol }}</span>
    </div>
    <div class="flex flex-col justify-center text-sm">
      <span>≈ ${{ priceUdtTotal }}</span>
      <span>({{ displayTokenReserve(props.position.quoteQuantity, props.position.quoteDecimals, props.position.quoteSymbol) }} /</span>
      <span>{{ displayTokenReserve(props.position.baseQuantity, props.position.baseDecimals, props.position.baseSymbol) }})</span>
    </div>
    <div class="flex items-center justify-center text-center">
      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-2 text-sm">
          <span v-if="props.position.poolType === 'FARM'" class="flex items-center gap-1 font-semibold text-success">
            <BaseIcon name="loading" size="16" class="text-success" />
            <span>Farming</span>
          </span>
          <span :class="classStatus">{{ capitalizeFirstLetter(props.position.positionStatus) }}</span>
        </div>
        <div v-if="showUnStake || showStake" class="flex gap-2">
          <template v-if="showUnStake">
            <span
              class="flex h-6 items-center justify-center rounded border border-solid border-hyperlink px-[10px] text-sm text-hyperlink"
              @click.stop="emit('unstake', props.position, priceUdtTotal)"
            >
              <span>Unstake</span>
            </span>
            <span class="flex h-6 items-center justify-center rounded bg-hyperlink px-[10px] text-sm text-white" @click.stop="handleClickHarvest">
              <BaseIcon v-if="loadingHarvest" name="loading" size="12" class="animate-spin text-white" />
              <span>Harvest</span>
            </span>
          </template>
          <span v-if="showStake" class="flex h-6 items-center justify-center rounded bg-hyperlink px-[10px] text-sm text-white" @click.stop="handleStake">
            <BaseIcon v-if="loadingStake" name="loading" size="12" class="animate-spin text-white" />
            <span>Stake</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // import type { CurrencyAmount, Token } from '@monchain/swap-sdk-core'
  import { LIST_NETWORK } from '~/constant'
  // import { Bound } from '~/types'
  import type { IPosition } from '~/types/position.type'
  import MasterChefV3ABI from '@/constant/abi/masterChefV3.json'
  import NonfungiblePositionManagerABI from '@/constant/abi/nonfungiblePositionManagerABI.json'
  import { waitForTransactionReceipt, writeContract } from '@wagmi/core'
  import { config } from '~/config/wagmi'
  import { CONTRACT_ADDRESS } from '~/constant/contract'
  import { useAccount } from '@wagmi/vue'
  import type { IExchangeRate } from '~/types'
  import Decimal from 'decimal.js'

  interface IProps {
    // position: PositionDetail
    position: IPosition
    listExchangeRate: IExchangeRate[]
  }

  const props = withDefaults(defineProps<IProps>(), {
    // position: () => ({}) as PositionDetail
    position: () => ({}) as IPosition,
    listExchangeRate: () => []
  })

  const emit = defineEmits<{
    unstake: [pos: IPosition, priceUsd: string]
  }>()

  const router = useRouter()

  // const { currency0, currency1, position: _position, tickAtLimit, base, priceLower, priceUpper, quote } = useExtraV3PositionInfo(props.position)

  const networkSelected = computed(() => {
    if (props.position) {
      return LIST_NETWORK.find((item) => item.value === props.position.network)
    }
    return undefined
  })

  const fee = computed(() => {
    if (props.position) {
      return `${props.position.fee / 10000}%`
    }
    return ''
  })

  const displayTokenReserve = (amount: number, decimals: number, symbol: string) => {
    // = (quoteQtty/10^quotedecimals) TokenA/(baseQtty/10^baseDecimals) TokenB
    return `${formatNumber((amount / Math.pow(10, decimals)).toFixed(2))} ${symbol}`
  }

  const enum TabValue {
    ALL = 'ALL',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    CLOSE = 'CLOSE'
  }

  function capitalizeFirstLetter(string: string) {
    if (!string) return ''
    return string.charAt(0).toUpperCase() + string.slice(1).toLocaleLowerCase()
  }

  const classStatus = computed(() => {
    const status = props.position.positionStatus
    return {
      'text-error': status === TabValue.CLOSE,
      'text-success': status === TabValue.ACTIVE,
      'text-warning': status === TabValue.INACTIVE
    }
  })

  const min = computed(() => {
    // priceLower*quotedecimals/basedecimals
    const { priceLower, baseDecimals, quoteDecimals } = props.position
    return props.position.priceLower ? formatNumber(((priceLower * quoteDecimals) / baseDecimals).toFixed(2)) : 0
  })

  const max = computed(() => {
    const { priceUpper, baseDecimals, quoteDecimals } = props.position
    return priceUpper ? formatNumber(((priceUpper * quoteDecimals) / baseDecimals).toFixed(2)) : 0
  })

  const showStake = computed(() => {
    return props.position.poolType === 'FARM' && !(Number(props.position.rewardApr ?? 0) > 0)
  })

  const showUnStake = computed(() => {
    return props.position.poolType === 'FARM' && Number(props.position.rewardApr ?? 0) > 0
  })

  const exchangeRateBaseCurrency = computed(() => {
    if (props.listExchangeRate.length) {
      const rateList = props.listExchangeRate.filter((item) => item.symbol === props.position.baseSymbol)
      if (rateList.length) {
        const rate = rateList.length === 1 ? rateList[0] : rateList.find((item) => item.slug === '')
        return rate ? new Decimal(rate.priceUsd).toSignificantDigits(6).toString() : '0'
      }
      return '0'
    }
    return '0'
  })

  const exchangeRateQuoteCurrency = computed(() => {
    if (props.listExchangeRate.length) {
      const rateList = props.listExchangeRate.filter((item) => item.symbol === props.position.quoteSymbol)
      if (rateList.length) {
        const rate = rateList.length === 1 ? rateList[0] : rateList.find((item) => item.slug === '')
        return rate ? new Decimal(rate.priceUsd).toSignificantDigits(6).toString() : '0'
      }
      return '0'
    }
    return '0'
  })

  const priceUdtTotal = computed(() => {
    return new Decimal(exchangeRateBaseCurrency.value).plus(exchangeRateQuoteCurrency.value).toSignificantDigits(6).toString()
  })

  const { showToastMsg } = useShowToastMsg()
  const { address: account } = useAccount()

  const loadingHarvest = ref(false)
  const handleClickHarvest = async () => {
    try {
      console.log('Harvest')
      if (loadingHarvest.value) return
      loadingHarvest.value = true
      const hash = await writeContract(config, {
        abi: MasterChefV3ABI,
        address: CONTRACT_ADDRESS.MASTER_CHEF_V3 as `0x${string}`,
        functionName: 'harvest',
        args: [props.position.tokenId, account.value]
      })
      console.log('🚀 ~ handleClickHarvest ~ hash:', hash)

      const { status } = await waitForTransactionReceipt(config, {
        hash,
        pollingInterval: 2000
      })
      if (status === 'success') {
        showToastMsg('Harvested! Your funds ORB earnings have been sent to your wallet', 'success', hash)
      } else {
        showToastMsg('Transaction failed', 'error', hash)
      }
    } catch (error) {
      console.error('handleClickHarvest ~ error', error)
      //@ts-ignore
      const msg = error?.shortMessage || null
      if (msg) {
        showToastMsg(msg, 'error')
      }
    } finally {
      loadingHarvest.value = false
    }
  }

  const loadingStake = ref(false)
  const handleStake = async () => {
    try {
      if (loadingStake.value) return
      loadingStake.value = true
      const hash = await writeContract(config, {
        abi: NonfungiblePositionManagerABI,
        address: CONTRACT_ADDRESS.NFT_POSITION_MANAGER_ADDRESSES as `0x${string}`,
        functionName: 'safeTransferFrom',
        args: [account.value, CONTRACT_ADDRESS.MASTER_CHEF_V3, props.position.tokenId]
      })

      const { status } = await waitForTransactionReceipt(config, {
        hash,
        pollingInterval: 2000
      })
      if (status === 'success') {
        showToastMsg('Staked! Your funds have heen staked in the farm', 'success', hash)
      } else {
        showToastMsg('Transaction failed', 'error', hash)
      }
    } catch (error) {
      console.error('handleStake ~ error', error)
      //@ts-ignore
      const msg = error?.shortMessage || null
      if (msg) {
        showToastMsg(msg, 'error')
      }
    } finally {
      loadingStake.value = false
    }
  }
</script>

<style lang="scss"></style>
