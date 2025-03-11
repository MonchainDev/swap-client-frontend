<template>
  <div v-loading="isLoading" class="mx-auto mt-10 max-w-[1024px] pb-6">
    <div class="grid grid-cols-2 gap-10">
      <div class="flex items-center justify-between">
        <div class="flex gap-4">
          <NuxtLink to="/liquidity/positions" class="flex size-10 items-center justify-center rounded-lg border border-solid border-gray-3 bg-white">
            <BaseIcon name="arrow-down" size="24" class="rotate-90" />
          </NuxtLink>
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-[9px] text-xl font-semibold">
              <span>Liquidity Pools & Farms /</span>
              <div class="flex">
                <img src="/token-default.png" alt="token " class="size-[25px] rounded-full border border-solid border-white" />
                <img src="/token-default.png" alt="token " class="-ml-4 size-[25px] rounded-full border border-solid border-white" />
              </div>
              <span>{{ currencyQuote?.symbol }} + {{ currencyBase?.symbol }}</span>
            </div>
            <div class="text-sm">
              <span class="text-[#049C6B]">Active</span>
              <span class="px-2 text-gray-4">|</span>
              <span>#{{ tokenId?.toString() }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex gap-6">
        <div class="flex gap-10">
          <div class="flex flex-col gap-[6px]">
            <span class="text-sm">Fee tier</span>
            <span class="text-xl font-semibold">{{ formatFee }}</span>
          </div>
          <div class="flex flex-col gap-[6px]">
            <span class="text-sm">Network</span>
            <div class="flex items-center gap-[10px] text-xl font-semibold">
              <img src="/logo-mon-chain.png" alt="logo" class="size-5 rounded-full" />
              <span>Mon chain</span>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <BaseButton
            type="outline"
            :disabled="!isConnected || !isOwner"
            size="md"
            class="flex w-[95px] items-center justify-center !gap-0 !bg-white text-xl"
            @click="handleClickAddLiquidity"
          >
            <BaseIcon name="plus" size="20" class="text-hyperlink" />
            <span class="text-hyperlink">Add</span>
          </BaseButton>

          <BaseButton :disabled="!isConnected || !isOwner" type="outline" size="md" class="w-[120px] !bg-white text-xl">
            <NuxtLink :to="{ name: 'remove-network-tokenId', params: { network: route.params.network, tokenId: route.params.tokenId } }">
              <span class="text-hyperlink">Remove</span>
            </NuxtLink>
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="mt-12 rounded-lg bg-white shadow-md">
      <div class="grid grid-cols-2 gap-8 border-b border-solid border-gray-3 p-8">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-4">
              <span class="text-2xl font-semibold leading-7">Liquidity</span>
              <span class="flex items-center gap-1 text-sm">
                <span>APR</span>
                <BaseIcon name="calculator" size="16" class="text-gray-4" />
                <span class="text-[#049C6B]">{{ positionDetail?.feeApr }}% </span>
              </span>
            </div>
            <span class="text-[48px] font-semibold">${{ Number(priceUsdBase) + Number(priceUsdQuote) }}</span>
          </div>
          <div class="flex h-[164px] flex-col rounded-lg bg-gray-1">
            <div class="flex h-1/2 items-center justify-between border-b border-solid border-gray-3 px-8">
              <div class="flex items-center gap-[10px]">
                <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
                <span class="text-[22px] font-semibold leading-7">{{ unwrappedToken(positionValueUpper?.currency)?.symbol }}</span>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <span class="text-[22px] font-semibold leading-7">{{ formattedValueUpper }}</span>
                <span class="text-sm text-gray-6">${{ priceUsdBase }}</span>
              </div>
            </div>
            <div class="flex h-1/2 items-center justify-between px-8">
              <div class="flex items-center gap-[10px]">
                <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
                <span class="text-[22px] font-semibold leading-7">{{ unwrappedToken(positionValueLower?.currency)?.symbol }}</span>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <span class="text-[22px] font-semibold leading-7">{{ formattedValueLower }}</span>
                <span class="text-sm text-gray-6">${{ priceUsdQuote }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex justify-between">
            <div class="flex flex-col">
              <span class="text-2xl font-semibold leading-7">Unclaimed fees</span>
              <span class="line-clamp-1 text-[48px] font-semibold text-hyperlink">${{ Number(priceUsdFeeLower) + Number(priceUsdFeeUpper) }}</span>
            </div>
            <BaseButton
              :disabled="disabledCollect"
              :loading="loadingCollect"
              type="linear"
              size="md"
              class="w-[170px] text-xl font-semibold uppercase"
              @click="handleCollect"
              >Collect</BaseButton
            >
          </div>

          <div class="flex h-[164px] flex-col rounded-lg bg-gray-1">
            <div class="flex h-1/2 items-center justify-between border-b border-solid border-gray-3 px-8">
              <div class="flex items-center gap-[10px]">
                <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
                <span class="text-[22px] font-semibold leading-7">{{ feeValueUpper?.currency.symbol }}</span>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <span class="text-[22px] font-semibold leading-7">{{ formattedFeeUpper }}</span>
                <span class="text-sm text-gray-6">${{ priceUsdFeeUpper }}</span>
              </div>
            </div>
            <div class="flex h-1/2 items-center justify-between px-8">
              <div class="flex items-center gap-[10px]">
                <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
                <span class="text-[22px] font-semibold leading-7">{{ feeValueLower?.currency.symbol }}</span>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <span class="text-[22px] font-semibold leading-7">{{ formattedFeeLower }}</span>
                <span class="text-sm text-gray-6">${{ priceUsdFeeLower }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4 px-8 pb-10 pt-6">
        <span class="text-2xl font-semibold leading-7">Price range {{ currencyQuote?.symbol }}/{{ currencyBase?.symbol }}</span>
        <div class="flex items-center gap-10">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-8">Min</span>
            <span class="text-base font-semibold">{{ minAmount }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-8">Max</span>
            <span class="text-base font-semibold">{{ maxAmount }} </span>
          </div>
          <ChartLine />
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-8">Current price</span>
            <span class="text-base font-semibold">{{ currentPrice }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 rounded-lg bg-white pb-6 shadow-md">
      <span class="block pl-6 pt-8 text-2xl font-semibold leading-7">History</span>
      <BaseTable :data="[]" :loading="false" class="table-history mt-[26px]">
        <ElTableColumn label="Timestamp" />
        <ElTableColumn label="Action" />
        <ElTableColumn label="Token Transferred" align="right" />
      </BaseTable>
    </div>
  </div>
  <PopupAddLiquidity
    :currency-base
    :position="position"
    :currency-quote
    :position-value-lower
    :position-value-upper
    :value-lower="formattedValueLower"
    :value-upper="formattedValueUpper"
    :fee-format="formatFee"
    :usd-lower="priceUsdQuote"
    :usd-upper="priceUsdBase"
    @reload="refetch"
  />
</template>

<script lang="ts" setup>
  import { type Currency, type Price, type Token } from '@monchain/swap-sdk-core'
  import type { FeeAmount, Pool } from '@monchain/v3-sdk'
  import { nearestUsableTick, Position, TICK_SPACINGS, TickMath } from '@monchain/v3-sdk'
  import { useAccount } from '@wagmi/vue'
  import Decimal from 'decimal.js'
  import ChartLine from '~/components/chart/ChartLine.vue'
  import PopupAddLiquidity from '~/components/liquidity/PopupAddLiquidity.vue'
  import { Bound, ChainId } from '~/types'
  import type { IPosition } from '~/types/position.type'

  const route = useRoute('liquidity-network-tokenId')
  const { setOpenPopup } = useBaseStore()

  const tokenId = computed(() => {
    return route.params.tokenId ? BigInt(route.params.tokenId) : undefined
  })
  const { chainId, isConnected, address: account } = useAccount()
  const { feeAmount, form, existingPosition, exchangeRateBaseCurrency, exchangeRateQuoteCurrency } = storeToRefs(useLiquidityStore())

  const { isLoading, position: _position, refetch } = useV3PositionsFromTokenId(tokenId.value)

  const { data: positionDetail } = useFetch<IPosition>(`/api/position/get/${tokenId.value?.toString()}`, { query: { network: route.params.network } })

  const liquidity = computed(() => _position.value?.liquidity)
  const tickLower = computed(() => _position.value?.tickLower)
  const tickUpper = computed(() => _position.value?.tickUpper)
  const token0Address = computed(() => _position.value?.token0)
  const token1Address = computed(() => _position.value?.token1)
  const fee = computed(() => _position.value?.fee)

  const formatFee = computed(() => {
    return fee.value ? `${fee.value / 10000}%` : ''
  })

  // const removed = computed(() => liquidity.value === 0n)

  const token0 = ref<Token>()
  const token1 = ref<Token>()

  const unwrapToken0 = computed(() => unwrappedToken(token0.value))
  const unwrapToken1 = computed(() => unwrappedToken(token1.value))

  watchEffect(async () => {
    if (_position.value) {
      token0.value = await getTokenByChainId(token0Address.value as string, chainId.value || ChainId.MON_TESTNET)
      token1.value = await getTokenByChainId(token1Address.value as string, chainId.value || ChainId.MON_TESTNET)

      feeAmount.value = fee.value ?? 0
    }
  })

  const inverted = computed(() => (token1.value && base.value ? base.value.equals(token1.value) : undefined))

  // if pool has aNATIVE, set token0 or 1 to NATIVE
  watchEffect(() => {
    if (unwrapToken0.value && unwrapToken1.value) {
      form.value.token0 = {
        ...unwrapToken0.value,
        icon_url: '',
        name: unwrapToken0.value?.name || '',
        decimals: unwrapToken0.value?.decimals ?? 18,
        symbol: unwrapToken0.value?.symbol ?? '',
        address: unwrapToken0.value.isNative ? '' : (token0.value?.address as string)
      }
      form.value.token1 = {
        ...unwrapToken1.value,
        icon_url: '',
        name: unwrapToken1.value?.name || '',
        decimals: unwrapToken1.value?.decimals ?? 18,
        symbol: unwrapToken1.value?.symbol ?? '',
        address: unwrapToken1.value.isNative ? '' : (token1.value?.address as string)
      }
    }
  })

  const currency0 = computed(() => (token0.value ? unwrappedToken(token0.value) : undefined))
  const currency1 = computed(() => (token1.value ? unwrappedToken(token1.value) : undefined))

  const { pool } = usePools()

  const receiveWNATIVE = ref(false)
  const { feeValue0, feeValue1, owner } = useV3PositionFees(pool as Ref<Pool>, tokenId, receiveWNATIVE.value)

  const feeValueUpper = computed(() => (inverted.value ? feeValue0.value : feeValue1.value))
  const feeValueLower = computed(() => (inverted.value ? feeValue1.value : feeValue0.value))
  const isOwner = computed(() => account.value === owner.value)

  // these currencies will match the feeValue{0,1} currencies for the purposes of fee collection
  // const currency0ForFeeCollectionPurposes = computed(() =>
  //   pool.value ? (receiveWNATIVE.value ? pool.value.token0 : unwrappedToken(pool.value.token0)) : undefined
  // )
  // const currency1ForFeeCollectionPurposes = computed(() =>
  //   pool.value ? (receiveWNATIVE.value ? pool.value.token1 : unwrappedToken(pool.value.token1)) : undefined
  // )

  const position = computed(() => {
    if (pool.value && typeof liquidity.value === 'bigint' && typeof tickLower.value === 'number' && typeof tickUpper.value === 'number') {
      return new Position({ pool: pool.value as Pool, liquidity: liquidity.value.toString(), tickLower: tickLower.value, tickUpper: tickUpper.value })
    }
    return undefined
  })

  const tickAtLimit = computed(() => {
    if (position.value) {
      return {
        [Bound.LOWER]:
          fee.value && tickLower.value ? tickLower.value === nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[fee.value as FeeAmount]) : undefined,
        [Bound.UPPER]:
          fee.value && tickUpper.value ? tickUpper.value === nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[fee.value as FeeAmount]) : undefined
      }
    }
    return undefined
  })

  const priceFromPosition = computed(() => {
    return getPriceOrderingFromPositionForUI(position.value)
  })

  const manuallyInverted = ref(false)

  const priceLower = computed(() => {
    return manuallyInverted.value ? priceFromPosition.value?.priceUpper?.invert() : priceFromPosition.value?.priceLower
  })
  const priceUpper = computed(() => {
    return manuallyInverted.value ? priceFromPosition.value?.priceLower?.invert() : priceFromPosition.value?.priceUpper
  })
  const base = computed(() => (manuallyInverted.value ? priceFromPosition.value?.quote : priceFromPosition.value?.base))
  // const quote = computed(() => (manuallyInverted.value ? priceFromPosition.value?.base : priceFromPosition.value?.quote))

  const minAmount = computed(() => {
    return formatTickPrice(priceLower.value, tickAtLimit.value ?? {}, Bound.LOWER, 'en-US')
  })

  const maxAmount = computed(() => {
    return formatTickPrice(priceUpper.value, tickAtLimit.value ?? {}, Bound.UPPER, 'en-US')
  })

  const currentPrice = computed(() => {
    if (pool.value) {
      return formatPrice(
        inverted.value ? (pool.value?.token1Price as Price<Currency, Currency> | undefined) : (pool.value.token0Price as Price<Currency, Currency> | undefined),
        6,
        'en-US'
      )
    }
    return ''
  })

  const currencyQuote = computed(() => (inverted.value ? currency0.value : currency1.value))
  const currencyBase = computed(() => (inverted.value ? currency1.value : currency0.value))

  const positionValueUpper = computed(() => (inverted.value ? position.value?.amount0 : position.value?.amount1))
  const positionValueLower = computed(() => (inverted.value ? position.value?.amount1 : position.value?.amount0))

  const formattedValueUpper = computed(() => {
    return formattedCurrencyAmount(positionValueUpper.value)
  })
  const formattedValueLower = computed(() => {
    return formattedCurrencyAmount(positionValueLower.value)
  })

  const formattedFeeUpper = computed(() => {
    return formatCurrencyAmount(feeValueUpper.value, 4, 'en-US')
  })

  const formattedFeeLower = computed(() => {
    return formatCurrencyAmount(feeValueLower.value, 4, 'en-US')
  })

  const priceUsdBase = computed(() => {
    if (!formattedValueUpper.value) return '0'
    if (currencyBase.value && exchangeRateBaseCurrency.value) {
      return new Decimal(formattedValueUpper.value.replaceAll(',', '')).mul(exchangeRateBaseCurrency.value).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const priceUsdQuote = computed(() => {
    if (!formattedValueLower.value) return '0'
    if (currencyQuote.value && exchangeRateQuoteCurrency.value) {
      return new Decimal(formattedValueLower.value.replaceAll(',', '')).mul(exchangeRateQuoteCurrency.value).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const priceUsdFeeUpper = computed(() => {
    if (!feeValueUpper.value) return '0'
    if (currencyBase.value && exchangeRateBaseCurrency.value) {
      return new Decimal(feeValueUpper.value.toExact()).mul(exchangeRateBaseCurrency.value).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const priceUsdFeeLower = computed(() => {
    if (!feeValueLower.value) return '0'
    if (currencyQuote.value && exchangeRateQuoteCurrency.value) {
      return new Decimal(feeValueLower.value.toExact()).mul(exchangeRateQuoteCurrency.value).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const handleClickAddLiquidity = () => {
    existingPosition.value = position.value as Position
    // form.value.token0 = { ...token0.value, icon_url: '', name: token0.value?.name || '' } as unknown as IToken
    // form.value.token1 = { ...token1.value, icon_url: '', name: token1.value?.name || '' } as unknown as IToken
    // feeAmount.value = fee.value ?? 0
    setOpenPopup('popup-add-liquidity')
  }

  const disabledCollect = computed(() => {
    return !isConnected.value || !isOwner.value || (feeValue0.value?.equalTo(0) && feeValue1.value?.equalTo(0))
  })

  const { collectFee, loading: loadingCollect } = useCollectFee()

  const handleCollect = async () => {
    if (feeValue0.value && feeValue1.value) {
      const options: Omit<CollectOptions, 'tokenId'> = {
        recipient: account.value as `0x${string}`,
        expectedCurrencyOwed0: feeValue0.value,
        expectedCurrencyOwed1: feeValue1.value
      }
      collectFee(tokenId.value, options)
    }
  }
</script>

<style lang="scss" scoped>
  .table-history {
    :deep(.el-table) {
      .el-table__header {
        tr th:first-child {
          padding-left: 12px;
        }
      }
      .el-table__body {
        tr td:first-child {
          padding-left: 12px;
        }
      }
    }
  }
</style>
