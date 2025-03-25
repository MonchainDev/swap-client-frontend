<template>
  <div v-loading="false" class="relative mx-auto max-w-[1024px] pb-6 sm:mt-0 sm:px-4" :class="{ 'pt-10': loading, 'mt-10': !loading }">
    <div class="flex items-center justify-between sm:hidden">
      <div class="flex gap-4">
        <NuxtLink
          :to="{ name: 'liquidity-network-tokenId', params: { tokenId: route.params.tokenId, network: route.params.network } }"
          class="flex size-10 items-center justify-center rounded-lg border border-solid border-gray-3 bg-white"
        >
          <BaseIcon name="arrow-down" size="24" class="rotate-90" />
        </NuxtLink>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-[9px] text-xl font-semibold">
            <span>Liquidity Pools & Farms /</span>
            <div class="flex">
              <img src="/token-default.png" alt="token " class="size-[25px] rounded-full border border-solid border-white" />
              <img src="/token-default.png" alt="token " class="-ml-4 size-[25px] rounded-full border border-solid border-white" />
            </div>
            <span>{{ liquidityValue0?.currency.symbol }} + {{ liquidityValue1?.currency?.symbol }}</span>
          </div>
          <div class="text-sm">
            <span class="text-[#049C6B]">Active</span>
            <span class="px-2 text-gray-4">|</span>
            <span>#{{ tokenId?.toString() }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="relative z-10 mx-auto mt-12 max-w-[580px] rounded-lg bg-white px-8 pb-[66px] pt-[34px] shadow-sm sm:mt-0 sm:px-4 sm:pt-4">
      <div class="items-center gap-2 sm:flex">
        <NuxtLink
          :to="{ name: 'liquidity-network-tokenId', params: { tokenId: route.params.tokenId, network: route.params.network } }"
          class="hidden size-6 items-center justify-center sm:flex"
        >
          <BaseIcon name="arrow-down" size="24" class="rotate-90" />
        </NuxtLink>
        <h4 class="text-2xl font-semibold leading-7 sm:text-sm">
          Remove {{ liquidityValue0?.currency.symbol }} + {{ liquidityValue1?.currency.symbol }} liquidity
        </h4>
      </div>

      <div class="mt-3 flex items-center justify-between gap-2 sm:flex-col sm:items-start sm:gap-3">
        <ElInput
          v-model="percent"
          placeholder="0%"
          class="input-percent"
          :formatter="(value: string) => formatNumberInput(value, true)"
          :parser="(value: string) => parseNumberInput(value)"
        />
        <div class="flex gap-2">
          <span
            v-for="item in percentList"
            :key="item"
            class="h-fit cursor-pointer rounded-[4px] bg-gray-2 px-2 py-[2px] text-sm text-gray-8"
            @click="percent = item"
          >
            {{ item }}%
          </span>
        </div>
      </div>
      <div class="-ml-8 mt-4 h-[1px] w-[580px] bg-gray-2 sm:hidden"></div>
      <div class="mt-[30px] flex flex-col gap-4">
        <h4 class="text-lg font-medium leading-7">You will receive</h4>
        <div class="flex h-[164px] flex-col rounded-lg bg-gray-1">
          <div class="flex h-1/2 items-center justify-between border-b border-solid border-gray-3 px-8 sm:px-4">
            <div class="flex items-center gap-[10px]">
              <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
              <span class="text-xl font-semibold leading-7">{{ liquidityValue0?.currency.symbol }} Pooled</span>
            </div>
            <div class="flex flex-col gap-1 text-right">
              <span class="text-[22px] font-semibold leading-7">{{ formattedValue0 }}</span>
              <span class="text-sm text-gray-6">${{ formatNumber(priceUsd0) }}</span>
            </div>
          </div>
          <div class="flex h-1/2 items-center justify-between px-8 sm:px-4">
            <div class="flex items-center gap-[10px]">
              <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
              <span class="text-xl font-semibold leading-7">{{ liquidityValue1?.currency.symbol }} Pooled</span>
            </div>
            <div class="flex flex-col gap-1 text-right">
              <span class="text-[22px] font-semibold leading-7">{{ formattedValue1 }}</span>
              <span class="text-sm text-gray-6">${{ formatNumber(priceUsd1) }}</span>
            </div>
          </div>
        </div>
        <div class="flex h-[164px] flex-col rounded-lg bg-gray-1">
          <div class="flex h-1/2 items-center justify-between border-b border-solid border-gray-3 px-8 sm:px-4">
            <div class="flex items-center gap-[10px]">
              <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
              <span class="text-xl font-semibold leading-7">{{ liquidityValue0?.currency.symbol }} Fee Earned</span>
            </div>
            <div class="flex flex-col gap-1 text-right">
              <span class="text-[22px] font-semibold leading-7">{{ formattedFee0 }}</span>
              <span class="text-sm text-gray-6">${{ formatNumber(priceUsdFee0) }}</span>
            </div>
          </div>
          <div class="flex h-1/2 items-center justify-between px-8 sm:px-4">
            <div class="flex items-center gap-[10px]">
              <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
              <span class="text-xl font-semibold leading-7">{{ liquidityValue1?.currency.symbol }} Fee Earned</span>
            </div>
            <div class="flex flex-col gap-1 text-right">
              <span class="text-[22px] font-semibold leading-7">{{ formattedFee1 }}</span>
              <span class="text-sm text-gray-6">${{ formatNumber(priceUsdFee1) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showCollectAsWNative" class="mt-[30px] flex items-center gap-4">
        <ElSwitch v-model="receiveNative" />
        <span class="text-base">Collect as WMON</span>
      </div>
      <BaseButton
        size="md"
        class="mt-6 w-full text-xl font-semibold uppercase"
        :type="disabledButton ? 'outline' : 'linear'"
        :disabled="disabledButton"
        @click="setOpenPopup('popup-confirm-remove')"
        >{{ textBtn }}</BaseButton
      >
    </div>
    <div class="bg-linear-mb absolute left-0 top-0 hidden h-[100px] w-screen sm:block"></div>
  </div>
  <BasePopup name="popup-confirm-remove" width="540" title="Confirm removing liquidity">
    <div class="px-8 pb-6">
      <div class="flex h-[164px] flex-col rounded-lg bg-gray-1">
        <div class="flex h-1/2 items-center justify-between border-b border-solid border-gray-3 px-8">
          <div class="flex items-center gap-[10px]">
            <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
            <span class="text-xl font-semibold leading-7">{{ liquidityValue0?.currency.symbol }} Pooled</span>
          </div>
          <div class="flex flex-col text-right">
            <span class="text-[22px] font-semibold leading-7">{{ formattedValue0 }}</span>
          </div>
        </div>
        <div class="flex h-1/2 items-center justify-between px-8">
          <div class="flex items-center gap-[10px]">
            <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
            <span class="text-xl font-semibold leading-7">{{ liquidityValue1?.currency.symbol }} Pooled</span>
          </div>
          <div class="flex flex-col text-right">
            <span class="text-[22px] font-semibold leading-7">{{ formattedValue1 }}</span>
          </div>
        </div>
      </div>
      <BaseButton :loading="loadingBtn" size="md" class="mt-6 w-full text-xl font-semibold uppercase" @click="handleRemove">Confirm</BaseButton>
    </div>
  </BasePopup>
</template>

<script lang="ts" setup>
  import { CurrencyAmount, Percent } from '@monchain/swap-sdk-core'
  import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import { useAccount } from '@wagmi/vue'
  import { hexToBigInt } from 'viem'
  import { config } from '~/config/wagmi'
  import { BIPS_BASE } from '~/constant'
  // import { NonfungiblePositionManager } from '@monchain/v3-sdk'
  import Decimal from 'decimal.js'
  import { WNATIVE } from '~/constant/token'
  import type { IBodyTxCollect } from '~/types/encrypt.type'
  import { MasterChefV3 } from '~/utils/masterChefV3'
  import { NonfungiblePositionManager } from '~/utils/nonfungiblePositionManager'

  definePageMeta({
    middleware: ['reset-form-liquidity-middleware', 'reset-all-popup-middleware', 'validate-network-middleware']
  })

  const route = useRoute('remove-network-tokenId')
  const router = useRouter()

  const percent = ref('')
  const percentList = ref(['10', '20', '50', '75'])
  const receiveNative = ref(false)

  const { chainId } = useActiveChainId()
  const { address: account } = useAccount()
  const { setOpenPopup } = useBaseStore()
  const { exchangeRateBaseCurrency, exchangeRateQuoteCurrency } = storeToRefs(useLiquidityStore())
  const { currentNetwork } = storeToRefs(useBaseStore())

  const tokenId = computed(() => {
    return route.params.tokenId ? BigInt(route.params.tokenId) : undefined
  })

  // const nativeCurrency = computed(() => Native.onChain(chainId.value!))
  // const nativeWrappedSymbol = computed(() => nativeCurrency.value?.wrapped.symbol)

  const { position } = useV3PositionsFromTokenId(tokenId.value)

  const { tokenIds } = useV3TokenIdsByAccount(getMasterChefV3Address(chainId.value))

  const isStakeMV3 = computed(() => tokenIds.value?.includes(tokenId.value!))

  const loading = computed(() => !positionSDK.value)

  const disabledButton = computed(() => !percent.value || !parseFloat(percent.value) || parseFloat(percent.value) > 100)
  const textBtn = computed(() => {
    return !account.value ? 'Connect wallet' : disabledButton.value ? 'Enter a percent' : 'Remove'
  })
  const {
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    position: positionSDK,
    feeValue0,
    feeValue1
  } = useDerivedV3BurnInfo(position, percent, receiveNative)

  const { poolAddresses } = usePools()

  const formattedFee0 = computed(() => formattedCurrencyAmount(feeValue0.value))
  const formattedFee1 = computed(() => formattedCurrencyAmount(feeValue1.value))

  const formattedValue0 = computed(() => {
    return formattedCurrencyAmount(liquidityValue0.value)
  })
  const formattedValue1 = computed(() => {
    return formattedCurrencyAmount(liquidityValue1.value)
  })

  const priceUsd0 = computed(() => {
    if (liquidityValue0.value) {
      return new Decimal(liquidityValue0.value.toExact()).mul(exchangeRateBaseCurrency.value).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const priceUsd1 = computed(() => {
    if (liquidityValue1.value) {
      return new Decimal(liquidityValue1.value.toExact()).mul(exchangeRateQuoteCurrency.value).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const priceUsdFee0 = computed(() => {
    if (feeValue0.value) {
      return new Decimal(feeValue0.value.toExact()).mul(exchangeRateBaseCurrency.value).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const priceUsdFee1 = computed(() => {
    if (feeValue1.value) {
      return new Decimal(feeValue1.value.toExact()).mul(exchangeRateQuoteCurrency.value).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const showCollectAsWNative = computed(() => {
    return Boolean(
      liquidityValue0.value?.currency &&
        liquidityValue1.value?.currency &&
        (liquidityValue0.value?.currency.isNative ||
          liquidityValue1.value?.currency.isNative ||
          WNATIVE[liquidityValue0.value?.currency.chainId as keyof typeof WNATIVE]?.equals(liquidityValue0.value?.currency.wrapped) ||
          WNATIVE[liquidityValue1.value?.currency.chainId as keyof typeof WNATIVE]?.equals(liquidityValue1.value?.currency.wrapped))
    )
  })

  const basisPointsToPercent = useMemoize((num: number): Percent => {
    return new Percent(BigInt(num), BIPS_BASE)
  })

  const loadingBtn = ref(false)
  const { showToastMsg } = useShowToastMsg()

  const handleRemove = async () => {
    try {
      if (
        !liquidityPercentage.value ||
        !tokenId.value ||
        !account.value ||
        !positionSDK.value ||
        !chainId.value ||
        !liquidityValue0.value ||
        !liquidityValue1.value
      )
        return
      loadingBtn.value = true

      const deadline = Math.floor(Date.now() / 1000) + 5 * 60 // 5 minutes
      const allowedSlippage = 50

      const interfaceManager = isStakeMV3.value ? MasterChefV3 : NonfungiblePositionManager
      const addressTo = isStakeMV3.value ? getMasterChefV3Address(chainId.value) : getNftPositionManagerAddress(chainId.value)

      // we fall back to expecting 0 fees in case the fetch fails, which is safe in the
      // vast majority of cases
      const { calldata, value } = interfaceManager.removeCallParameters(positionSDK.value, {
        tokenId: tokenId.value!,
        liquidityPercentage: liquidityPercentage.value,
        slippageTolerance: basisPointsToPercent(allowedSlippage),
        deadline: deadline.toString(),
        collectOptions: {
          expectedCurrencyOwed0: feeValue0.value ?? CurrencyAmount.fromRawAmount(liquidityValue0.value.currency, 0),
          expectedCurrencyOwed1: feeValue1.value ?? CurrencyAmount.fromRawAmount(liquidityValue1.value.currency, 0),
          recipient: account.value
        }
      })

      console.log('🚀 ~ handleRemove ~ value:', value)
      console.log('🚀 ~ handleRemove ~ calldata:', calldata)

      const txHash = await sendTransaction(config, {
        to: addressTo,
        data: calldata,
        value: hexToBigInt(value),
        account: account.value
      })
      console.log('🚀 ~ handleRemove ~ txHash:', txHash)

      const { status } = await waitForTransactionReceipt(config, {
        hash: txHash,

        pollingInterval: 2000
      })

      if (status === 'success') {
        percent.value = ''
        showToastMsg('Transaction receipt', 'success', getUrlScan(chainId.value, 'tx', txHash))
        setOpenPopup('popup-confirm-remove', false)
        const body: IBodyTxCollect = {
          transactionHash: txHash,
          poolAddress: poolAddresses.value ? poolAddresses.value[0] : '',
          tokenId: +route.params.tokenId,
          fromAddress: account.value!,
          toAddress: addressTo,
          fromToken: positionSDK.value.pool.token0.address,
          toToken: positionSDK.value.pool.token1.address,
          network: currentNetwork.value.network,
          transactionType: 'REMOVE_LIQUID'
        }
        await postTransaction(body)
        router.push({ name: 'liquidity-network-tokenId', params: { tokenId: route.params.tokenId, network: route.params.network } })
      } else {
        showToastMsg('Transaction failed', 'error', getUrlScan(chainId.value, 'tx', txHash))
      }
    } catch (error) {
      console.error(error)
      showToastMsg('Transaction failed', 'error')
    } finally {
      loadingBtn.value = false
    }
  }
</script>

<style lang="scss" scoped>
  :deep(.input-percent) {
    .el-input__wrapper {
      box-shadow: unset;
      background-color: transparent;
      padding-right: 0;

      .el-input__inner {
        height: 48px;
        font-size: 48px;
        font-weight: 600;
        background: linear-gradient(91deg, #790c8b 60%, #1573fe 98%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        overflow: hidden;
        &::placeholder {
          background: linear-gradient(91deg, #a8abb2 0%, #a8abb2 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }
  }
</style>
