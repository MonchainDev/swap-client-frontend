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
          <img :src="networkSelected?.logo" :alt="networkSelected?.name" class="size-[14px]" />
          <span class="text-xs text-gray-8">{{ networkSelected?.name }} | #{{ props.position.tokenId }}</span>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center">
      <span class="rounded bg-gray-2 px-2 py-1 text-sm">{{ fee }}</span>
    </div>
    <div class="flex flex-col items-center justify-center gap-1 px-1 text-sm">
      <!-- <div class="break-all font-semibold text-success">{{ formatNumber((props.position.feeApr || 0).toFixed(2)) }}%</div> -->
      <div class="break-all text-success">{{ formatNumber((props.position.rewardApr || 0).toFixed(2)) }}%</div>
    </div>
    <div class="flex flex-col justify-center pr-[10px] text-sm">
      <span>Min: {{ formatNumber(min) }} {{ props.position.quoteSymbol }}/{{ props.position.baseSymbol }}</span>
      <span>Max: {{ formatNumber(max) }} {{ props.position.quoteSymbol }}/{{ props.position.baseSymbol }}</span>
    </div>
    <div class="flex flex-col justify-center text-sm">
      <span>≈ ${{ formatNumberAbbreviation(priceUdtTotal) }}</span>
      <span>({{ displayTokenReserve(props.position.quoteQuantity, props.position.quoteDecimals, props.position.quoteSymbol) }} /</span>
      <span>{{ displayTokenReserve(props.position.baseQuantity, props.position.baseDecimals, props.position.baseSymbol) }})</span>
    </div>
    <div class="flex items-center justify-center text-center">
      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-2 text-sm">
          <!-- <span v-if="props.position.poolType === 'FARM'" class="flex items-center gap-1 font-semibold text-success">
            <BaseIcon name="loading" size="16" class="text-success" />
            <span>Farming</span>
          </span> -->
          <span :class="classStatus">{{ capitalizeFirstLetter(props.position.positionStatus) }}</span>
        </div>
        <div v-if="showUnStake || showStake || showHarvest" class="flex gap-2">
          <span
            v-if="showUnStake"
            class="flex h-6 items-center justify-center rounded border border-solid border-hyperlink px-[10px] text-sm text-hyperlink"
            @click.stop="emit('unstake', props.position, priceUdtTotal)"
          >
            <span>Unstake</span>
          </span>
          <span
            v-if="showHarvest"
            class="flex h-6 items-center justify-center rounded bg-hyperlink px-[10px] text-sm text-white"
            @click.stop="handleClickHarvest"
          >
            <BaseIcon v-if="loadingHarvest" name="loading" size="12" class="animate-spin text-white" />
            <span>Harvest</span>
          </span>
          <span v-if="showStake" class="flex h-6 items-center justify-center rounded bg-hyperlink px-[10px] text-sm text-white" @click.stop="handleStake">
            <BaseIcon v-if="loadingStake" name="loading" size="12" class="animate-spin text-white" />
            <span> Stake </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // import type { CurrencyAmount, Token } from '@wicchain/swap-sdk-core'
  import { DEFAULT_NETWORK, LIST_NETWORK } from '~/config/networks'
  // import { Bound } from '~/types'
  import { readContract, sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import { useAccount } from '@wagmi/vue'
  import Decimal from 'decimal.js'
  import { hexToBigInt } from 'viem'
  import { config } from '~/config/wagmi'
  import { type IExchangeRate } from '~/types'
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

  // const { currency0, currency1, position: _position, tickAtLimit, base, priceLower, priceUpper, quote } = useExtraV3PositionInfo(props.position)

  const networkSelected = computed(() => {
    if (props.position) {
      return LIST_NETWORK.find((item) => item.network === props.position.network)
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
    // return `${formatNumber((amount / Math.pow(10, decimals)).toFixed(2))} ${symbol}`
    return `${formatNumber(toSignificant(amount / Math.pow(10, decimals)))} ${symbol}`
  }

  const enum TabValue {
    ALL = 'ALL',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    CLOSE = 'CLOSE'
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
    // return Number(props.position.rewardApr) > 0 || stakeLocalSuccess.value
    return props.position.stakeStatus === 'Y' || stakeLocalSuccess.value
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

  const priceUdtTotal = computed(() => {
    const baseValueUsd = new Decimal(props.position.baseQuantity / Math.pow(10, props.position.baseDecimals)).mul(exchangeRateBaseCurrency.value)
    const quoteValueUsd = new Decimal(props.position.quoteQuantity / Math.pow(10, props.position.quoteDecimals)).mul(exchangeRateQuoteCurrency.value)
    return toSignificant(baseValueUsd.plus(quoteValueUsd).toString())
  })

  const { showToastMsg } = useShowToastMsg()
  const { address: account } = useAccount()

  const chainId = computed(() => {
    return LIST_NETWORK.find((item) => item.network === props.position.network)?.chainId
  })

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
        value: hexToBigInt(value),
        chainId: chainId.value
      })

      console.log('🚀 ~ handleClickHarvest ~ hash:', hash)

      const { status } = await waitForTransactionReceipt(config, {
        hash,
        pollingInterval: 2000
      })
      if (status === 'success') {
        showToastMsg(
          `Harvested! Your funds ${DEFAULT_NETWORK.network} earnings have been sent to your wallet`,
          'success',
          getUrlScan(chainId.value, 'tx', hash),
          chainId.value
        )
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
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 12000)
        })
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
        value: hexToBigInt(value),
        chainId: chainId.value
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
</script>

<style lang="scss"></style>
