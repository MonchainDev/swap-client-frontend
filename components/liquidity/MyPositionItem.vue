<template>
  <div class="flex gap-[70px] border-b border-solid border-gray-3 py-3 first:pt-0 last:border-none">
    <div class="flex flex-1 flex-col gap-1 sm:gap-2">
      <div class="flex items-center gap-[10px]">
        <div class="flex">
          <img :src="tokenLogoBySymbol(props.position?.baseSymbol)" alt="token" class="size-8 rounded-full border border-solid border-white" />
          <img :src="tokenLogoBySymbol(props.position?.quoteSymbol)" alt="token" class="-ml-4 size-8 rounded-full border border-solid border-white" />
        </div>
        <div
          class="group flex flex-1 flex-col"
          @click="router.push({ name: 'liquidity-network-tokenId', params: { network: props.position.network, tokenId: props.position.tokenId } })"
        >
          <div class="line-clamp-1 cursor-pointer text-sm font-semibold group-hover:text-hyperlink">
            {{ props.position?.baseSymbol }}/{{ props.position.quoteSymbol }}
          </div>
          <div class="flex items-center space-x-1">
            <img :src="networkSelected?.logo" :alt="networkSelected?.name" class="size-[14px]" />
            <span class="text-xs text-gray-8">{{ networkSelected?.name }} | #{{ props.position.tokenId }}</span>
          </div>
        </div>
        <span class="hidden text-xs sm:block" :class="classStatus">{{ capitalizeFirstLetter(props.position.positionStatus) }}</span>
      </div>
      <template v-if="isDesktop">
        <div class="flex gap-1 text-xs">
          <span>Min: {{ formatNumber(min) }} {{ props.position.baseSymbol }}/{{ props.position.quoteSymbol }}</span>
          <span>|</span>
          <span>Max: {{ formatNumber(max) }} {{ props.position.baseSymbol }}/{{ props.position.quoteSymbol }}</span>
        </div>
        <div class="flex gap-1 text-xs">
          <span
            >≈ ${{ formatNumberAbbreviation(priceUdtTotal) }} ({{
              displayTokenReserve(props.position.quoteQuantity, props.position.quoteDecimals, props.position.quoteSymbol)
            }}
            /{{ displayTokenReserve(props.position.baseQuantity, props.position.baseDecimals, props.position.baseSymbol) }})</span
          >
          <span>|</span>
          <span
            >APR: <span class="font-semibold text-success">{{ formatNumber((props.position.rewardApr || 0).toFixed(2)) }}%</span></span
          >
        </div>
        <span class="text-xs font-semibold"
          >{{ TOKEN_REWARDS[chainId as ChainId]?.symbol }} earned: {{ toSignificant(amountTokenEarn) }} (${{
            formatNumberAbbreviation(priceUsdEarnToken)
          }})</span
        >
      </template>
      <template v-else>
        <div class="flex items-center gap-2">
          <div class="flex flex-1 gap-1 text-sm">
            <span class="font-semibold text-success"> Up to {{ formatNumber((props.position.rewardApr || 0).toFixed(2)) }}% </span>
          </div>
          <span class="rounded bg-gray-2 px-2 py-1 text-xs font-medium">{{ props.position.fee / 10000 }}%</span>
        </div>
        <div class="break-all text-xs">
          <span>Min: {{ formatNumber(min) }} {{ props.position.baseSymbol }}/{{ props.position.quoteSymbol }}</span>
          <span class="pl-2">Max: {{ formatNumber(max) }} {{ props.position.baseSymbol }}/{{ props.position.quoteSymbol }}</span>
        </div>
        <span class="break-all text-xs"
          >≈ ${{ formatNumberAbbreviation(priceUdtTotal) }} ({{
            displayTokenReserve(props.position.quoteQuantity, props.position.quoteDecimals, props.position.quoteSymbol)
          }}
          /{{ displayTokenReserve(props.position.baseQuantity, props.position.baseDecimals, props.position.baseSymbol) }})</span
        >
        <div v-if="showStake || showUnStake || showHarvest" class="flex gap-4">
          <span
            v-if="showUnStake"
            class="flex h-6 w-full cursor-pointer items-center justify-center rounded border border-solid border-hyperlink px-[10px] text-sm text-hyperlink"
            @click.stop="emit('unstake', props.position, priceUdtTotal)"
          >
            <span>Unstake</span>
          </span>
          <span
            v-if="showHarvest"
            class="flex h-6 w-full cursor-pointer items-center justify-center rounded bg-hyperlink px-[10px] text-sm text-white"
            @click.stop="handleClickHarvest"
          >
            <BaseIcon v-if="loadingHarvest" name="loading" size="12" class="animate-spin text-white" />
            <span>Harvest</span>
          </span>

          <span
            v-if="showStake"
            class="flex h-6 w-full cursor-pointer items-center justify-center rounded bg-hyperlink px-[10px] text-sm text-white"
            @click.stop="handleStake"
          >
            <BaseIcon v-if="loadingStake" name="loading" size="12" class="animate-spin text-white" />
            <span>Stake</span>
          </span>
        </div>
      </template>
    </div>
    <div v-if="isDesktop" class="flex flex-col items-end gap-3">
      <div class="flex items-center gap-2 text-sm">
        <span v-if="showUnStake" class="flex items-center gap-1 text-success">
          <BaseIcon name="loading" size="16" class="text-success" />
          <span>Farming</span>
        </span>
        <span :class="classStatus">{{ capitalizeFirstLetter(props.position.positionStatus) }}</span>
      </div>
      <div v-if="showUnStake || showStake" class="flex gap-2">
        <template v-if="showUnStake">
          <span
            class="flex h-6 cursor-pointer items-center justify-center rounded border border-solid border-hyperlink px-[10px] text-sm text-hyperlink"
            @click.stop="emit('unstake', props.position, priceUdtTotal)"
          >
            <span>Unstake</span>
          </span>
          <span class="flex h-6 cursor-pointer items-center justify-center rounded bg-hyperlink px-[10px] text-sm text-white" @click.stop="handleClickHarvest">
            <BaseIcon v-if="loadingHarvest" name="loading" size="12" class="animate-spin text-white" />
            <span>Harvest</span>
          </span>
        </template>
        <span
          v-if="showStake"
          class="flex h-6 cursor-pointer items-center justify-center rounded bg-hyperlink px-[10px] text-sm text-white"
          @click.stop="handleStake"
        >
          <BaseIcon v-if="loadingStake" name="loading" size="12" class="animate-spin text-white" />
          <span>Stake</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // import type { CurrencyAmount, Token } from '@monchain/swap-sdk-core'
  import { LIST_NETWORK } from '~/config/networks'
  // import { Bound } from '~/types'
  import { useQuery } from '@tanstack/vue-query'
  import { readContract, sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import { useAccount } from '@wagmi/vue'
  import Decimal from 'decimal.js'
  import { hexToBigInt } from 'viem'
  import { TOKEN_REWARDS } from '~/config/tokens'
  import { config } from '~/config/wagmi'
  import { type ChainId, type IExchangeRate } from '~/types'
  import type { IBodyTxCollect } from '~/types/encrypt.type'
  import type { IPosition } from '~/types/position.type'
  import { MasterChefV3 } from '~/utils/masterChefV3'
  import { NonfungiblePositionManager } from '~/utils/nonfungiblePositionManager'

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
    reload: []
  }>()

  const router = useRouter()
  const { isDesktop } = useDesktop()

  // const { currency0, currency1, position: _position, tickAtLimit, base, priceLower, priceUpper, quote } = useExtraV3PositionInfo(props.position)

  const networkSelected = computed(() => {
    if (props.position) {
      return LIST_NETWORK.find((item) => item.network === props.position.network)
    }
    return undefined
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

  const { min, max } = useCalcPricePosition(() => props.position)

  const showStake = computed(() => {
    return (
      props.position.stakeStatus === 'N' &&
      props.position.poolType === 'FARM' &&
      Number(props.position.moonPerSecond) > 0 &&
      !stakeLocalSuccess.value &&
      props.position.positionStatus !== 'CLOSE'
    )
  })

  const showUnStake = computed(() => {
    return props.position.stakeStatus === 'Y'
  })

  const showHarvest = computed(() => {
    return props.position.stakeStatus === 'Y' && Number(props.position.pendingReward) > 0
  })

  const exchangeRateBaseCurrency = computed(() => {
    if (props.listExchangeRate.length) {
      const rateList = props.listExchangeRate.filter((item) => item.symbol === props.position.baseSymbol)
      if (rateList.length) {
        const isSlug = rateList.some((item) => item.slug === '')
        const rate =
          rateList.length === 1
            ? rateList[0]
            : isSlug
              ? rateList.find((item) => item.slug === '')
              : rateList.find((item) => item.symbol === props.position.baseSymbol)

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
        const isSlug = rateList.some((item) => item.slug === '')
        const rate =
          rateList.length === 1
            ? rateList[0]
            : isSlug
              ? rateList.find((item) => item.slug === '')
              : rateList.find((item) => item.symbol === props.position.quoteSymbol)

        return rate ? new Decimal(rate.priceUsd).toSignificantDigits(6).toString() : '0'
      }
      return '0'
    }
    return '0'
  })

  const exchangeRateEarnToken = computed(() => {
    const symbol = TOKEN_REWARDS[chainId.value as ChainId]?.symbol
    if (props.listExchangeRate.length && symbol) {
      const rateList = props.listExchangeRate.filter((item) => item.symbol === symbol)
      if (rateList.length) {
        const isSlug = rateList.some((item) => item.slug === '')
        const rate = rateList.length === 1 ? rateList[0] : isSlug ? rateList.find((item) => item.slug === '') : rateList.find((item) => item.symbol === symbol)

        return rate ? new Decimal(rate.priceUsd).toSignificantDigits(6).toString() : '0'
      }
      return '0'
    }
    return '0'
  })

  const priceUdtTotal = computed(() => {
    const baseValueUsd = new Decimal(props.position.baseQuantity / Math.pow(10, props.position.baseDecimals)).mul(exchangeRateBaseCurrency.value)
    const quoteValueUsd = new Decimal(props.position.quoteQuantity / Math.pow(10, props.position.quoteDecimals)).mul(exchangeRateQuoteCurrency.value)
    return toSignificant(baseValueUsd.plus(quoteValueUsd).toString())
  })

  const { showToastMsg } = useShowToastMsg()
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()

  const stakeLocalSuccess = ref(false)

  const loadingHarvest = ref(false)
  const handleClickHarvest = async () => {
    try {
      console.log('Harvest')
      const contractAddressMasterChef = getMasterChefV3Address(chainId.value)
      if (!contractAddressMasterChef) throw new Error('Invalid contract address')

      if (loadingHarvest.value) return
      loadingHarvest.value = true

      const { calldata, value } = MasterChefV3.harvestCallParameters({ to: account.value!, tokenId: props.position.tokenId })

      const hash = await sendTransaction(config, {
        to: contractAddressMasterChef,
        data: calldata,
        value: hexToBigInt(value)
      })

      console.log('🚀 ~ handleClickHarvest ~ hash:', hash)

      const { status } = await waitForTransactionReceipt(config, {
        hash,
        pollingInterval: 2000
      })
      if (status === 'success') {
        showToastMsg('Harvested! Your funds ORB earnings have been sent to your wallet', 'success', getUrlScan(chainId.value, 'tx', hash), chainId.value)
        const { tokenId, network, tokenBase, tokenQuote, poolAddress, pendingReward } = props.position
        const body: IBodyTxCollect = {
          transactionHash: hash,
          tokenId,
          network,
          fromToken: tokenBase,
          toToken: tokenQuote,
          fromAddress: account.value,
          toAddress: contractAddressMasterChef,
          poolAddress,
          rewardAmount: pendingReward,
          transactionType: 'HARVEST'
        }
        await postTransaction(body)
        emit('reload')
      } else {
        showToastMsg('Transaction failed', 'error', getUrlScan(chainId.value, 'tx', hash), chainId.value)
      }
      loadingHarvest.value = false
    } catch (error) {
      loadingHarvest.value = false
      console.error('handleClickHarvest ~ error', error)
      //@ts-ignore
      const msg = error?.shortMessage || null
      if (msg) {
        showToastMsg(msg, 'error')
      }
    }
  }

  const loadingStake = ref(false)
  const handleStake = async () => {
    try {
      const contractAddressMasterChef = getMasterChefV3Address(chainId.value)
      const contractAddressNftPositionManager = getNftPositionManagerAddress(chainId.value)
      if (!contractAddressNftPositionManager) throw new Error('Invalid contract address')
      if (!contractAddressMasterChef) throw new Error('Invalid contract address')

      if (loadingStake.value) return
      loadingStake.value = true

      const { calldata, value } = NonfungiblePositionManager.safeTransferFromParameters({
        recipient: contractAddressMasterChef,
        tokenId: props.position.tokenId,
        sender: account.value as `0x${string}`
      })

      const hash = await sendTransaction(config, {
        to: contractAddressNftPositionManager,
        data: calldata,
        value: hexToBigInt(value)
      })

      const { status } = await waitForTransactionReceipt(config, {
        hash,
        pollingInterval: 2000
      })
      if (status === 'success') {
        showToastMsg('Staked! Your funds have heen staked in the farm', 'success', getUrlScan(chainId.value, 'tx', hash), chainId.value)

        const { tokenId, network, tokenBase, tokenQuote, poolAddress, pendingReward } = props.position
        const body: IBodyTxCollect = {
          transactionHash: hash,
          tokenId,
          network,
          fromToken: tokenBase,
          toToken: tokenQuote,
          fromAddress: account.value,
          toAddress: contractAddressNftPositionManager,
          poolAddress,
          rewardAmount: pendingReward,
          transactionType: 'STAKE'
        }
        await Promise.allSettled([v3PoolAddressPid(contractAddressMasterChef), postTransaction(body)])
        setTimeout(() => {
          emit('reload')
        }, 12000)
      } else {
        showToastMsg('Transaction failed', 'error', getUrlScan(chainId.value, 'tx', hash), chainId.value)
      }
      loadingStake.value = false
    } catch (error) {
      loadingStake.value = false
      console.error('handleStake ~ error', error)
      //@ts-ignore
      const msg = error?.shortMessage || null
      if (msg) {
        showToastMsg(msg, 'error')
      }
    }
  }

  async function v3PoolAddressPid(address: `0x${string}`) {
    const amount = (await readContract(config, {
      address,
      abi: MasterChefV3.ABI,
      functionName: 'v3PoolAddressPid',
      args: [props.position.poolAddress],
      chainId: chainId.value
    })) as bigint
    console.log('🚀 ~ v3PoolAddressPid ~ amount:', amount)
    stakeLocalSuccess.value = amount > BigInt(0)
  }

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
    const decimals = TOKEN_REWARDS[chainId.value as ChainId]?.decimals ?? 0
    return new Decimal(amount.toString()).div(Math.pow(10, decimals)).toNumber() || 0
  }

  const { data: amountTokenEarn } = useQuery({
    queryKey: ['pendingMoon', props.position.tokenId],
    queryFn: getPendingMoon,
    enabled: computed(() => !!props.position.tokenId)
  })

  const priceUsdEarnToken = computed(() => {
    const rate = exchangeRateEarnToken.value
    return new Decimal(rate)
      .mul(amountTokenEarn.value ?? '0')
      .toSignificantDigits(6)
      .toString()
  })

  defineExpose({
    priceUdtTotal,
    rewardApr: props.position.rewardApr,
    priceUsdEarnToken,
    amountTokenEarn
  })
</script>

<style lang="scss" scoped></style>
