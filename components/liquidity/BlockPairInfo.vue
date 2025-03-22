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
    <div class="grid min-h-[421px] grid-cols-[374px_1fr] gap-6">
      <div class="rounded-lg bg-white px-6 py-4 shadow-md">
        <div class="flex flex-col gap-[6px]">
          <span class="text-sm">Total Tokens locked (TVL)</span>
          <div class="flex items-center gap-3">
            <span class="text-xl font-semibold">${{ (pool.tvl ?? 0).toFixed(2) }}</span>
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
            <span class="text-sm">{{ pool.baseQtty ? formatNumberWithDecimal(pool.baseQtty, pool.baseDecimals) : 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-[5px]">
              <img src="/token-default.png" alt="logo" class="size-[14px] rounded-full" />
              <span class="text-sm">{{ pool.quoteSymbol }}</span>
            </div>
            <span class="text-sm">{{ pool.quoteQtty ? formatNumberWithDecimal(pool.quoteQtty, pool.quoteDecimals) : 0 }}</span>
          </div>
        </div>
        <div class="mt-[35px] flex flex-col gap-8">
          <div class="flex flex-col gap-[6px]">
            <span class="text-sm">Volume 24h</span>
            <div class="flex items-center gap-3">
              <span class="text-xl font-semibold">${{ formatNumber((pool.volume24h || 0).toFixed(2)) }}</span>
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
        <div v-loading="isLoading" class="mt-7">
          <component :is="component" v-if="!isLoading" :chart-data="chartData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import Decimal from 'decimal.js'
  import type { ITab } from '~/types/component.type'
  import type { IPool } from '~/types/pool.type'
  import ChartLiquidity from '../chart/ChartLiquidity.vue'
  import ChartVolume from '../chart/ChartVolume.vue'
  import ChartFee from '../chart/ChartFee.vue'
  import ChartTvl from '../chart/ChartTvl.vue'
  import { gql } from 'graphql-request'
  import { useQuery } from '@tanstack/vue-query'
  const enum TabValue {
    VOLUME = 'VOLUME',
    LIQUIDITY = 'LIQUIDITY',
    FEE = 'FEE',
    TVL = 'TVL'
  }

  export interface poolDayDatas {
    date: number
    feeUSD: string
    tvlUSD: string
    volumeUSD: string
    liquidity: string
    token0Price: string
    token1Price: string
    pool: {
      totalValueLockedToken0: string
      token0: {
        symbol: string
      }
      token1: {
        symbol: string
      }
    }
  }

  export interface IDataChart {
    date: string
    value: string
    token0Price: string
    token1Price: string
    token0Symbol: string
    token1Symbol: string
    totalValueLockedToken0: string
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

  const component = computed(() => {
    switch (tabActive.value) {
      case TabValue.LIQUIDITY:
        return ChartLiquidity
      case TabValue.FEE:
        return ChartFee
      case TabValue.TVL:
        return ChartTvl

      default:
        return ChartVolume
    }
  })

  const fee24h = computed(() => {
    const volume = new Decimal(props.pool.volume24h)
    const fee = new Decimal(props.pool.fee).div(10000).toString()
    return (
      volume
        .mul(fee)
        .div(10 ** 6)
        .toSignificantDigits(6)
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

  const { data, isLoading } = useQuery({
    queryKey: computed(() => ['poolData', props.pool.poolAddress]),
    queryFn: () => getPoolData(props.pool.poolAddress),
    enabled: computed(() => !!props.pool.poolAddress),
    retry: 2
  })

  const chartData = computed((): IDataChart[] => {
    const valueMap = {
      [TabValue.VOLUME]: 'volumeUSD',
      [TabValue.LIQUIDITY]: 'liquidity',
      [TabValue.FEE]: 'feesUSD',
      [TabValue.TVL]: 'tvlUSD'
    }

    const selectedValue = valueMap[tabActive.value]

    return data.value?.poolDayDatas
      ? data.value?.poolDayDatas
          .map((item: poolDayDatas) => ({
            date: new Date(item.date * 1000).toLocaleDateString(),
            value: item[selectedValue as keyof poolDayDatas]?.toString(),
            token0Price: item.token0Price ?? '0',
            token1Price: item.token1Price ?? '0',
            token0Symbol: item.pool.token0.symbol,
            token1Symbol: item.pool.token1.symbol,
            totalValueLockedToken0: item.pool.totalValueLockedToken0 ?? '0'
          }))
          //@ts-ignore
          .sort((a: IDataChart, b: IDataChart) => new Date(a.date).getTime() - new Date(b.date).getTime())
      : []
  })

  // Hàm thực thi query với pool address
  async function getPoolData(poolAddress: string) {
    try {
      const client = getGraphQLClient(props.pool.chainId)
      // Định nghĩa query với variable
      const query = gql`
        query MyQuery($poolAddress: String!) {
          poolDayDatas(first: 30, orderBy: date, orderDirection: desc, where: { pool: $poolAddress }) {
            id
            liquidity
            volumeUSD
            feesUSD
            tvlUSD
            date
            token0Price
            token1Price
            pool {
              totalValueLockedToken0
              token0 {
                symbol
              }
              token1 {
                symbol
              }
            }
          }
        }
      `
      const variables = {
        poolAddress: poolAddress
      }
      const data = await client.request<{ poolDayDatas: poolDayDatas[] }>(query, variables)
      console.log('🚀 ~ getPoolData ~ data:', data.poolDayDatas)
      // console.log('Kết quả:', JSON.stringify(data, null, 2))
      return data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
</script>

<style lang="scss" scoped></style>
