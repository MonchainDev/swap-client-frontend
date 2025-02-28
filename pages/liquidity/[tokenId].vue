<template>
  <div v-loading="isLoading" class="mx-auto mt-10 max-w-[1024px] pb-6">
    <div class="grid grid-cols-2 gap-10">
      <div class="flex items-center justify-between">
        <div class="flex gap-4">
          <NuxtLink to="/liquidity/pool" class="flex size-10 items-center justify-center rounded-lg border border-solid border-gray-3 bg-white">
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
          <BaseButton type="outline" size="md" class="flex w-[95px] items-center justify-center !gap-0 !bg-white text-xl" @click="handleClickAddLiquidity">
            <BaseIcon name="plus" size="20" class="text-hyperlink" />
            <span class="text-hyperlink">Add</span>
          </BaseButton>
          <NuxtLink :to="`/remove/${tokenId}`">
            <BaseButton type="outline" size="md" class="w-[120px] !bg-white text-xl">
              <span class="text-hyperlink">Remove</span>
            </BaseButton>
          </NuxtLink>
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
                <span class="text-[#049C6B]">0% </span>
              </span>
            </div>
            <span class="text-[48px] font-semibold">$0</span>
          </div>
          <div class="flex h-[164px] flex-col rounded-lg bg-gray-1">
            <div class="flex h-1/2 items-center justify-between border-b border-solid border-gray-3 px-8">
              <div class="flex items-center gap-[10px]">
                <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
                <span class="text-[22px] font-semibold leading-7">{{ unwrappedToken(positionValueUpper?.currency)?.symbol }}</span>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <span class="text-[22px] font-semibold leading-7">{{ formattedValueUpper }}</span>
                <span class="text-sm text-gray-6">$0</span>
              </div>
            </div>
            <div class="flex h-1/2 items-center justify-between px-8">
              <div class="flex items-center gap-[10px]">
                <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
                <span class="text-[22px] font-semibold leading-7">{{ unwrappedToken(positionValueLower?.currency)?.symbol }}</span>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <span class="text-[22px] font-semibold leading-7">{{ formattedValueLower }}</span>
                <span class="text-sm text-gray-6">$0</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex justify-between">
            <div class="flex flex-col">
              <span class="text-2xl font-semibold leading-7">Unclaimed fees</span>
              <span class="text-[48px] font-semibold text-hyperlink">$0</span>
            </div>
            <BaseButton type="linear" size="md" class="w-[170px] text-xl font-semibold uppercase">Collect</BaseButton>
          </div>

          <div class="flex h-[164px] flex-col rounded-lg bg-gray-1">
            <div class="flex h-1/2 items-center justify-between border-b border-solid border-gray-3 px-8">
              <div class="flex items-center gap-[10px]">
                <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
                <span class="text-[22px] font-semibold leading-7">ATOM</span>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <span class="text-[22px] font-semibold leading-7">0</span>
                <span class="text-sm text-gray-6">$0</span>
              </div>
            </div>
            <div class="flex h-1/2 items-center justify-between px-8">
              <div class="flex items-center gap-[10px]">
                <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
                <span class="text-[22px] font-semibold leading-7">ATOM</span>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <span class="text-[22px] font-semibold leading-7">0</span>
                <span class="text-sm text-gray-6">$0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4 px-8 pb-10 pt-6">
        <span class="text-2xl font-semibold leading-7">Price range {{ currencyQuote?.symbol }}/{{ currencyBase?.symbol }}</span>
        <div class="flex gap-10">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-8">Min</span>
            <span class="text-base font-semibold">{{ minAmount }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-8">Max</span>
            <span class="text-base font-semibold">{{ maxAmount }} </span>
          </div>
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
    v-model:invert="manuallyInverted"
    :currency-base
    :position="position"
    :currency-quote
    :position-value-lower
    :position-value-upper
    :value-lower="formattedValueLower"
    :value-upper="formattedValueUpper"
    :fee-format="formatFee"
    @reload="refetch"
  />
</template>

<script lang="ts" setup>
  import type { Currency, Price, Token } from '@pancakeswap/swap-sdk-core'
  import type { FeeAmount, Pool } from '@pancakeswap/v3-sdk'
  import { nearestUsableTick, Position, TICK_SPACINGS, TickMath } from '@pancakeswap/v3-sdk'
  import { useAccount } from '@wagmi/vue'
  import PopupAddLiquidity from '~/components/liquidity/PopupAddLiquidity.vue'
  import { Bound, type IToken } from '~/types'

  const route = useRoute('liquidity-tokenId')
  const { setOpenPopup } = useBaseStore()

  const tokenId = computed(() => {
    return route.params.tokenId ? BigInt(route.params.tokenId) : undefined
  })
  const { chainId } = useAccount()
  const { feeAmount, form, existingPosition } = storeToRefs(useLiquidityStore())

  const { isLoading, position: _position, refetch } = useV3PositionsFromTokenId(tokenId.value)

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

  watchEffect(async () => {
    if (_position.value) {
      token0.value = await getTokenByChainId(token0Address.value as string, chainId.value!)
      token1.value = await getTokenByChainId(token1Address.value as string, chainId.value!)

      form.value.token0 = { ...token0.value, icon_url: '', name: token0.value?.name || '' }
      form.value.token1 = { ...token1.value, icon_url: '', name: token1.value?.name || '' }
      feeAmount.value = fee.value ?? 0
    }
  })

  const currency0 = computed(() => (token0.value ? unwrappedToken(token0.value) : undefined))
  const currency1 = computed(() => (token1.value ? unwrappedToken(token1.value) : undefined))

  const { pool } = usePools()

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

  const inverted = computed(() => (token1.value && base.value ? base.value.equals(token1.value) : undefined))

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

  const handleClickAddLiquidity = () => {
    existingPosition.value = position.value as Position
    form.value.token0 = { ...token0.value, icon_url: '', name: token0.value?.name || '' } as unknown as IToken
    form.value.token1 = { ...token1.value, icon_url: '', name: token1.value?.name || '' } as unknown as IToken
    feeAmount.value = fee.value ?? 0
    setOpenPopup('popup-add-liquidity')
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
