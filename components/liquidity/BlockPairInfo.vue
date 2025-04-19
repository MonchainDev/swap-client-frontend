<template>
  <div class="flex flex-col gap-7 sm:gap-6">
    <div v-if="props.showHeader" class="flex items-center gap-5 text-sm sm:flex-col sm:items-start sm:gap-3">
      <span class="text-2xl font-semibold leading-7">Pair info</span>
      <div class="flex items-center gap-5 sm:flex-col sm:items-start sm:gap-3">
        <div class="flex items-center gap-1">
          <img :src="props.pool.baseLogo || ''" alt="logo" class="size-[14px] rounded-full" @error="handleImageError" />
          <span>1 {{ pool.baseSymbol }} = {{ formatNumber(price0) }} {{ pool.quoteSymbol }}</span>
        </div>
        <div class="flex items-center gap-1">
          <img :src="props.pool.quoteLogo || ''" alt="logo" class="size-[14px] rounded-full" @error="handleImageError" />
          <span> 1 {{ pool.quoteSymbol }} = {{ formatNumber(price1) }} {{ pool.baseSymbol }}</span>
        </div>
      </div>
    </div>
    <div class="grid min-h-[421px] grid-cols-[374px_1fr] gap-6 sm:grid-cols-1">
      <div class="rounded-lg bg-white px-6 py-4 shadow-md sm:px-4">
        <div class="flex flex-col gap-[6px]">
          <span class="text-sm">Total Tokens locked (TVL)</span>
          <div class="flex items-center gap-3">
            <span class="text-xl font-semibold">${{ formatNumber(toSignificant(infoVolume.today.tvl ?? 0)) }}</span>
            <span class="flex items-center gap-1 rounded-[10px] px-2 py-[2px]" :class="statusVolume.tvl.bg">
              <BaseIcon name="arrow-fill" size="12" :class="`${statusVolume.tvl.bg} ${statusVolume.tvl.rotate} ${statusVolume.tvl.status}`" />
              <span class="text-sm font-semibold" :class="statusVolume.tvl.status">{{ statusVolume.tvl.change }}%</span>
            </span>
          </div>
        </div>
        <div class="mt-[31px] flex flex-col gap-3 border-b border-t border-solid border-gray-3 py-5 pt-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-[5px]">
              <img :src="props.pool.baseLogo || ''" alt="logo" class="size-[14px] rounded-full" @error="handleImageError" />
              <span class="text-sm">{{ pool.baseSymbol }}</span>
            </div>
            <span class="text-sm">{{ pool.baseQtty ? formatNumberWithDecimal(pool.baseQtty, pool.baseDecimals) : 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-[5px]">
              <img :src="props.pool.quoteLogo || ''" alt="logo" class="size-[14px] rounded-full" @error="handleImageError" />
              <span class="text-sm">{{ pool.quoteSymbol }}</span>
            </div>
            <span class="text-sm">{{ pool.quoteQtty ? formatNumberWithDecimal(pool.quoteQtty, pool.quoteDecimals) : 0 }}</span>
          </div>
        </div>
        <div class="mt-[35px] flex flex-col gap-8">
          <div class="flex flex-col gap-[6px]">
            <span class="text-sm">Volume 24h</span>
            <div class="flex items-center gap-3">
              <span class="text-xl font-semibold">${{ formatNumber(infoVolume.today.volume) }}</span>
              <span class="flex items-center gap-1 rounded-[10px] px-2 py-[2px]" :class="statusVolume.volume.bg">
                <BaseIcon name="arrow-fill" size="12" :class="`${statusVolume.volume.bg} ${statusVolume.volume.rotate} ${statusVolume.volume.status}`" />
                <span class="text-sm font-semibold" :class="statusVolume.volume.status">{{ statusVolume.volume.change }}%</span>
              </span>
            </div>
          </div>
          <div class="flex flex-col gap-[6px]">
            <span class="text-sm">Fee 24h</span>
            <div class="flex items-center gap-3">
              <span class="text-xl font-semibold">${{ formatNumber(infoVolume.today.fee) }}</span>
              <span class="flex items-center gap-1 rounded-[10px] px-2 py-[2px]" :class="statusVolume.fee.bg">
                <BaseIcon name="arrow-fill" size="12" :class="`${statusVolume.fee.bg} ${statusVolume.fee.rotate} ${statusVolume.fee.status}`" />
                <span class="text-sm font-semibold" :class="statusVolume.fee.status">{{ statusVolume.fee.change }}%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="rounded-lg bg-white px-6 py-4 shadow-md sm:px-4">
        <BaseTab v-model:model="tabActive" :list="listTab" />
        <div v-loading="isLoading" class="mt-7">
          <component :is="component" v-if="!isLoading" :chart-data="chartData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useQuery } from '@tanstack/vue-query'
  import Decimal from 'decimal.js'
  import { gql } from 'graphql-request'
  import type { ITab } from '~/types/component.type'
  import type { IPool } from '~/types/pool.type'
  import ChartFee from '../chart/ChartFee.vue'
  import ChartLiquidity from '../chart/ChartLiquidity.vue'
  import ChartTvl from '../chart/ChartTvl.vue'
  import ChartVolume from '../chart/ChartVolume.vue'
  const enum TabValue {
    VOLUME = 'VOLUME',
    LIQUIDITY = 'LIQUIDITY',
    FEE = 'FEE',
    TVL = 'TVL'
  }

  interface IMetric {
    date: number
    tvlUSD: number
    volumeUSD: number
    liquidity: number
    feeUSD: number
    token0: Token
    token1: Token
    totalValueLockedToken0: number
  }

  interface Token {
    derivedUSD: string
    symbol: string
  }

  export interface poolDayDatas {
    id: string
    date: number
    volumeToken0: string
    volumeToken1: string
    feesUSD: string
    pool: {
      totalValueLockedToken0: string
      totalValueLockedToken1: string
      liquidity: string
      token0: Token
      token1: Token
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
  const { handleImageError } = useErrorImage()

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

  // const fee24h = computed(() => {
  //   const volume = new Decimal(props.pool.volume24h)
  //   const fee = new Decimal(props.pool.fee).div(10000).toString()
  //   return (
  //     volume
  //       .mul(fee)
  //       .div(10 ** 6)
  //       .toSignificantDigits(6)
  //       .toString() ?? '0'
  //   )
  // })

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

  const foramtedData = computed(() => {
    return data.value?.poolDayDatas.map((item: poolDayDatas) => ({
      ...calculateMetrics(item)
    }))
  })

  const chartData = computed((): IDataChart[] => {
    const valueMap = {
      [TabValue.VOLUME]: 'volumeUSD',
      [TabValue.LIQUIDITY]: 'liquidity',
      [TabValue.FEE]: 'feeUSD',
      [TabValue.TVL]: 'tvlUSD'
    }

    const selectedValue = valueMap[tabActive.value]

    return foramtedData.value && foramtedData.value?.length
      ? foramtedData.value
          .map((item: IMetric) => ({
            date: new Date(item.date * 1000).toLocaleDateString(),
            value: item[selectedValue as keyof IMetric]?.toString(),
            token0Price: item.token0.derivedUSD ?? '0',
            token1Price: item.token1.derivedUSD ?? '0',
            token0Symbol: item.token0.symbol,
            token1Symbol: item.token1.symbol,
            totalValueLockedToken0: item.totalValueLockedToken0.toString() ?? '0'
          }))
          .reverse()
      : []
  })

  const infoVolume = computed(() => {
    if (foramtedData.value?.length) {
      const today = foramtedData.value.find((item: IMetric) => {
        const date = new Date(item.date * 1000)
        return date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear()
      })
      const yesterday = foramtedData.value.find((item: IMetric) => {
        const date = new Date(item.date * 1000)
        return date.getDate() === new Date().getDate() - 1 && date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear()
      })
      if (!today) {
        return {
          today: {
            volume: 0,
            fee: 0,
            tvl: foramtedData.value[0].tvlUSD ?? 0
          },
          yesterday: {
            volume: 0,
            fee: 0,
            tvl: 0
          }
        }
      }
      if (!yesterday) {
        return {
          today: {
            volume: today.volumeUSD,
            fee: today.feeUSD,
            tvl: today.tvlUSD
          },
          yesterday: {
            volume: 0,
            fee: 0,
            tvl: 0
          }
        }
      }
      return {
        today: {
          volume: today.volumeUSD,
          fee: today.feeUSD,
          tvl: today.tvlUSD
        },
        yesterday: {
          volume: yesterday.volumeUSD ?? 0,
          fee: yesterday.feeUSD ?? 0,
          tvl: yesterday.tvlUSD ?? 0
        }
      }
    }
    return {
      today: {
        volume: 0,
        fee: 0,
        tvl: 0
      },
      yesterday: {
        volume: 0,
        fee: 0,
        tvl: 0
      }
    }
  })

  const statusVolume = computed(() => {
    const today = infoVolume.value.today
    const yesterday = infoVolume.value.yesterday
    const changeTvl = yesterday.tvl ? new Decimal(today.tvl).sub(yesterday.tvl).div(yesterday.tvl).mul(100).abs().toFixed(2) : '0'
    const changeVolume = yesterday.volume ? new Decimal(today.volume).sub(yesterday.volume).div(yesterday.volume).mul(100).abs().toFixed(2) : '0'
    const changeFee = yesterday.fee ? new Decimal(today.fee).sub(yesterday.fee).div(yesterday.fee).mul(100).abs().toFixed(2) : '0'
    return {
      tvl: {
        status: today.tvl >= yesterday.tvl ? 'text-up' : 'text-down',
        change: changeTvl,
        rotate: today.tvl >= yesterday.tvl ? 'rotate-180' : '',
        bg: today.tvl >= yesterday.tvl ? 'bg-[#E8FFEB]' : 'bg-[#FFECEF]'
      },
      volume: {
        status: today.volume >= yesterday.volume ? 'text-up' : 'text-down',
        change: changeVolume,
        rotate: today.volume >= yesterday.volume ? 'rotate-180' : '',
        bg: today.volume >= yesterday.volume ? 'bg-[#E8FFEB]' : 'bg-[#FFECEF]'
      },
      fee: {
        status: today.fee >= yesterday.fee ? 'text-up' : 'text-down',
        change: changeFee,
        rotate: today.fee >= yesterday.fee ? 'rotate-180' : '',
        bg: today.fee >= yesterday.fee ? 'bg-[#E8FFEB]' : 'bg-[#FFECEF]'
      }
    }
  })

  async function getPoolData(poolAddress: string) {
    try {
      const client = getGraphQLClient(props.pool.chainId)
      const query = gql`
        query PoolData($poolAddress: String!) {
          poolDayDatas(first: 365, orderBy: date, orderDirection: desc, where: { pool_: { id: $poolAddress } }) {
            volumeToken0
            volumeToken1
            feesUSD
            pool {
              totalValueLockedToken0
              totalValueLockedToken1
              liquidity
              token0 {
                symbol
                derivedUSD
              }
              token1 {
                derivedUSD
                symbol
              }
            }
            id
            date
          }
        }
      `
      const variables = {
        poolAddress: poolAddress
      }
      const data = await client.request<{ poolDayDatas: poolDayDatas[] }>(query, variables)
      console.log('🚀 ~ getPoolData ~ data:', data)
      return data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  function calculateMetrics(poolDayData: poolDayDatas): IMetric {
    const { pool, volumeToken0, feesUSD } = poolDayData
    const baseDerivedUsd = props.pool.baseDerivedUsd ?? 0
    const quoteDerivedUsd = props.pool.quoteDerivedUsd ?? 0

    const tvlUSD = parseFloat(pool.totalValueLockedToken0) * baseDerivedUsd + parseFloat(pool.totalValueLockedToken1) * quoteDerivedUsd

    const volumeUSD = parseFloat(volumeToken0) * baseDerivedUsd

    const liquidity = parseFloat(pool.liquidity)
    const feeRate = new Decimal(props.pool.fee).div(10 ** 6).toString()
    const feeUSD = new Decimal(feesUSD).mul(feeRate).toSignificantDigits(6).toNumber()

    return {
      date: poolDayData.date,
      tvlUSD: parseFloat(toSignificant(tvlUSD)),
      volumeUSD: parseFloat(toSignificant(volumeUSD)),
      liquidity: liquidity,
      feeUSD,
      token0: {
        derivedUSD: pool.token0.derivedUSD,
        symbol: pool.token0.symbol
      },
      token1: {
        derivedUSD: pool.token1.derivedUSD,
        symbol: pool.token1.symbol
      },
      totalValueLockedToken0: parseFloat(pool.totalValueLockedToken0)
    }
  }
</script>

<style lang="scss" scoped></style>
