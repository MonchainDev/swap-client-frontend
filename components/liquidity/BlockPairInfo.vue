<template>
  <div class="flex flex-col gap-7">
    <div v-if="props.showHeader" class="flex items-center gap-5 text-sm">
      <span class="text-2xl font-semibold leading-7">Pair info</span>
      <div class="flex items-center gap-1">
        <img src="/token-default.png" alt="logo" class="size-[14px] rounded-full" />
        <span>1 {{ pool.baseSymbol }} = {{ formatNumber(price0) }} {{ pool.quoteSymbol }}</span>
      </div>
      <div class="flex items-center gap-1">
        <img src="/token-default.png" alt="logo" class="size-[14px] rounded-full" />
        <span> 1 {{ pool.quoteSymbol }} = {{ formatNumber(price1) }} {{ pool.baseSymbol }}</span>
      </div>
    </div>
    <div class="grid h-[421px] grid-cols-[374px_1fr] gap-6">
      <div class="rounded-lg bg-white px-6 py-4 shadow-md">
        <div class="flex flex-col gap-[6px]">
          <span class="text-sm">Total Tokens locked (TVL)</span>
          <div class="flex items-center gap-3">
            <span class="text-xl font-semibold">$0</span>
            <span class="flex items-center gap-1 rounded-[10px] bg-[#E8FFEB] px-2 py-[2px]">
              <BaseIcon name="arrow-fill" size="12" class="rotate-180 text-success" />
              <span class="text-sm font-semibold text-success">0%</span>
            </span>
          </div>
        </div>
        <div class="mt-[31px] flex flex-col gap-3 border-b border-t border-solid border-gray-3 py-5 pt-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-[5px]">
              <img src="/token-default.png" alt="logo" class="size-[14px] rounded-full" />
              <span class="text-sm">{{ pool.baseSymbol }}</span>
            </div>
            <span class="text-sm">{{ formatNumberWithDecimal(pool.baseQtty, pool.baseDecimals) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-[5px]">
              <img src="/token-default.png" alt="logo" class="size-[14px] rounded-full" />
              <span class="text-sm">{{ pool.quoteSymbol }}</span>
            </div>
            <span class="text-sm">{{ formatNumberWithDecimal(pool.quoteQtty, pool.quoteDecimals) }}</span>
          </div>
        </div>
        <div class="mt-[35px] flex flex-col gap-8">
          <div class="flex flex-col gap-[6px]">
            <span class="text-sm">Volume 24h</span>
            <div class="flex items-center gap-3">
              <span class="text-xl font-semibold">${{ formatNumber(pool.volume24h) }}</span>
              <span class="flex items-center gap-1 rounded-[10px] bg-[#E8FFEB] px-2 py-[2px]">
                <BaseIcon name="arrow-fill" size="12" class="rotate-180 text-success" />
                <span class="text-sm font-semibold text-success">0%</span>
              </span>
            </div>
          </div>
          <div class="flex flex-col gap-[6px]">
            <span class="text-sm">Fee 24h</span>
            <div class="flex items-center gap-3">
              <span class="text-xl font-semibold">${{ formatNumber(fee24h) }}</span>
              <span class="flex items-center gap-1 rounded-[10px] bg-[#FFECEF] px-2 py-[2px]">
                <BaseIcon name="arrow-fill" size="12" class="text-error" />
                <span class="text-sm font-semibold text-error">0%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="rounded-lg bg-white px-6 py-4 shadow-md">
        <BaseTab v-model:model="tabActive" :list="listTab" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import Decimal from 'decimal.js'
  import type { ITab } from '~/types/component.type'
  import type { IPool } from '~/types/pool.type'
  const enum TabValue {
    VOLUME = 'VOLUME',
    LIQUIDITY = 'LIQUIDITY',
    FEE = 'FEE',
    TVL = 'TVL'
  }

  interface IProps {
    showHeader?: boolean
    pool: IPool
  }

  const props = withDefaults(defineProps<IProps>(), {
    showHeader: true,
    pool: () => ({}) as IPool
  })

  // const route = useRoute('liquidity-pool-network-address')

  const listTab: ITab[] = [
    {
      title: 'Volume',
      value: 'VOLUME'
    },
    {
      title: 'Liquidity',
      value: 'LIQUIDITY'
    },
    {
      title: 'Fee',
      value: 'FEE'
    },
    {
      title: 'TVL',
      value: 'TVL'
    }
  ]

  const tabActive = ref<TabValue>(TabValue.VOLUME)

  const fee24h = computed(() => {
    const volume = new Decimal(props.pool.volume24h)
    const fee = new Decimal(props.pool.fee).div(10000).toString()
    return (
      volume
        .mul(fee)
        .div(10 ** 6)
        .toString() ?? '0'
    )
  })

  const currentPrice = computed(() => {
    const sqrtX96 = new Decimal(2).pow(96).toString()
    return props.pool.currentPrice ? new Decimal(new Decimal(props.pool.currentPrice).div(sqrtX96)).pow(2).toString() : '0'
  })

  const price0 = computed(() => {
    return new Decimal(currentPrice.value).mul(props.pool.quoteDecimals).div(props.pool.baseDecimals).toSignificantDigits(6).toString()
  })

  const price1 = computed(() => {
    return parseFloat(price0.value) > 0 ? new Decimal(1).div(price0.value).toSignificantDigits(6).toString() : '0'
  })
</script>

<style lang="scss" scoped></style>
