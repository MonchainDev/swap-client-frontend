<template>
  <div class="mt-12 flex flex-col gap-[22px]">
    <span class="text-2xl font-semibold leading-7">My Positions</span>
    <div class="grid grid-cols-[374px_1fr] gap-6 sm:grid-cols-1">
      <div class="rounded-lg bg-white px-6 pb-6 pt-4 shadow-sm sm:px-4">
        <div class="flex flex-col gap-5 border-b border-dashed border-gray-4 pb-5">
          <span class="font-semibold">Overview</span>
          <div class="flex flex-col gap-3 text-sm">
            <div class="flex items-center justify-between">
              <span>My Liquidity Value</span>
              <span class="font-medium">${{ formatNumberAbbreviation(totalLiquidInAlPosition) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>My Total APR</span>
              <span class="font-medium">{{ formatNumber(totalApr) }}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Earning</span>
              <div class="flex items-center gap-1 font-medium">
                <span>LP Fee</span>
                <div class="flex">
                  <img src="/token-default.png" alt="logo" class="size-6" />
                  <img src="/token-default.png" alt="logo" class="-ml-3 size-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 flex flex-col gap-1">
          <span class="font-semibold">Total farming earning {{ TOKEN_REWARDS[props.pool.chainId as ChainId]?.symbol }}</span>
          <div class="flex items-end gap-1">
            <span class="text-linear text-[32px] font-semibold leading-none">${{ formatNumberAbbreviation(totalFarmingEarnUsd) }}</span>
            <span class="text-xs text-gray-7">{{ formatNumberAbbreviation(toSignificant(totalFarmingEarn, 6)) }}</span>
          </div>
        </div>
        <NuxtLink :to="`/add/${props.pool.tokenBase}/${props.pool.tokenQuote}/${props.pool.fee}?chain=${props.pool.network}`">
          <BaseButton class="mt-6 flex w-full items-center" size="sm">
            <BaseIcon name="plus" size="18" />
            <span>Add Liquidity</span>
          </BaseButton>
        </NuxtLink>
      </div>
      <div class="rounded-lg bg-white p-6 shadow-sm sm:px-4">
        <div class="flex justify-between sm:flex-col sm:items-start sm:gap-4">
          <span class="font-semibold">{{ formattedData.length }} positions</span>
          <BaseTab v-model:model="tabActive" :list="listTab" @update:model="() => refetch()" />
        </div>
        <div v-loading="isLoading || isRefetching" class="mt-6 h-[235px]">
          <template v-if="formattedData.length">
            <ElScrollbar>
              <MyPositionItem
                v-for="item in formattedData"
                ref="positionItem"
                :key="item.tokenId"
                :list-exchange-rate="listExchangeRate"
                :position="item"
                @reload="refetch"
                @unstake="
                  (pos, price) => {
                    positionCurrent = pos
                    positionCurrent.priceUdtTotal = price
                    setOpenPopup('popup-unstake')
                  }
                "
              />
            </ElScrollbar>
          </template>
          <template v-else>
            <div class="flex h-full items-center justify-center rounded-lg bg-gray-1">
              <BaseIcon name="trash" size="80" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
  <PopupUnStake :position="positionCurrent" @reload="refetch" />
</template>

<script lang="ts" setup>
  import { useQuery } from '@tanstack/vue-query'
  import { useAccount } from '@wagmi/vue'
  import type { ChainId, IExchangeRate } from '~/types'
  import type { ITab } from '~/types/component.type'
  import type { IPool } from '~/types/pool.type'
  import type { IPosition, IPositionOrigin } from '~/types/position.type'
  import MyPositionItem from './MyPositionItem.vue'
  import PopupUnStake from './PopupUnStake.vue'
  import { TOKEN_REWARDS } from '~/config/tokens'

  const enum TabValue {
    ALL = 'ALL',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    CLOSE = 'CLOSE'
  }

  interface IProps {
    pool: IPool
  }

  const props = withDefaults(defineProps<IProps>(), {
    pool: () => ({}) as IPool
  })

  const { address } = useAccount()
  const { setOpenPopup } = useBaseStore()

  const listTab: ITab[] = [
    { title: 'All', value: TabValue.ALL },
    { title: 'Active', value: TabValue.ACTIVE },
    { title: 'Inactive', value: TabValue.INACTIVE },
    { title: 'Closed', value: TabValue.CLOSE }
  ]

  const tabActive = ref<TabValue>(TabValue.ALL)
  const positionCurrent = ref<IPosition | undefined>(undefined)

  const positionItem = ref<InstanceType<typeof MyPositionItem>[] | null>(null)

  const calculateTotal = (propertyName: keyof InstanceType<typeof MyPositionItem>) => {
    if (!positionItem.value?.length) return 0

    return positionItem.value.reduce((acc: number, item) => {
      return acc + Number(item[propertyName])
    }, 0)
  }

  const totalLiquidInAlPosition = computed(() => calculateTotal('priceUdtTotal'))

  const totalFarmingEarnUsd = computed(() => calculateTotal('priceUsdEarnToken'))

  const totalFarmingEarn = computed(() => calculateTotal('amountTokenEarn'))

  // const { data, status, refresh } = await useLazyFetch<IResponse<IPositionOrigin[]>>(
  //   () => `/api/position/list?poolAddress=${props.pool.poolAddress.toLowerCase()}&createdBy=${address.value?.toLowerCase()}`,
  //   {
  //     key: [props.pool.poolAddress, address.value],
  //     immediate: true,
  //     onResponse: ({ response }) => {
  //       if (response._data?.content.length) {
  //         const list: string[] = response._data?.content.map((item: IPositionOrigin) => item.basesymbol && item.quotesymbol)
  //         const listUnique = Array.from(new Set(list))
  //         fetchExchangeRate(listUnique)
  //       }
  //     }
  //   }
  // )

  const { data, refetch, isLoading, isRefetching } = useQuery({
    queryKey: [props.pool.poolAddress, address.value, tabActive.value],
    queryFn: async () => {
      const result = await $fetch<IPositionOrigin[]>(
        `/api/position/list?poolAddress=${props.pool.poolAddress.toLowerCase()}&createdBy=${address.value?.toLowerCase()}&status=${tabActive.value === 'ALL' ? '' : tabActive.value}`
      )
      if (result.length) {
        const baseSymbol = result.map((item: IPositionOrigin) => item.basesymbol)
        const quoteSymbol = result.map((item: IPositionOrigin) => item.quotesymbol)
        const symbolTokenEarn = TOKEN_REWARDS[props.pool.chainId as ChainId]?.symbol ?? 'ORB'
        const listUnique = Array.from(new Set([...baseSymbol, ...quoteSymbol, symbolTokenEarn]))
        fetchExchangeRate(listUnique)
      }
      return result
    },
    enabled: computed(() => !!address.value && !!props.pool.poolAddress)
  })

  const formattedData = computed((): IPosition[] => {
    console.log(data.value)

    if (data.value?.length) {
      //@ts-ignore
      return data.value.map((data) => {
        return {
          poolAddress: data.pooladdress,
          tokenBase: data.tokenbase,
          tokenQuote: data.tokenquote,
          baseSymbol: data.basesymbol,
          quoteSymbol: data.quotesymbol,
          fee: data.fee,
          network: data.network,
          tickLower: data.ticklower,
          priceLower: data.pricelower,
          tickUpper: data.tickupper,
          priceUpper: data.priceupper,
          tokenId: data.tokenid,
          baseDecimals: data.basedecimals,
          quoteDecimals: data.quotedecimals,
          createdBy: data.createdby,
          createdAt: data.createdat,
          updatedAt: data.updatedat,
          feeApr: data.feeapr,
          rewardApr: data.rewardapr,
          baseQuantity: data.baseqtty,
          quoteQuantity: data.quoteqtty,
          poolType: data.pooltype,
          positionStatus: data.positionstatus,
          pendingReward: data.pendingreward ?? 0,
          moonPerSecond: data.moonpersecond ?? 0,
          stakeStatus: data.stakestatus ?? 'N'
        }
      })
    }
    return []
  })

  const totalApr = computed(() => {
    if (formattedData.value.length) {
      const total = formattedData.value.reduce((acc, item) => {
        const apr = Number(item.rewardApr)
        return acc + apr
      }, 0)
      return total.toFixed(2)
    }
    return 0
  })

  const listExchangeRate = ref<IExchangeRate[]>([])
  const fetchExchangeRate = async (currencies: string[]) => {
    const params = new URLSearchParams()
    if (currencies.length) {
      currencies.forEach((currency) => params.append('currencies', currency))
      const response = await useFetch<IExchangeRate[]>(`/api/exchange-rate/all?${params.toString()}`)
      listExchangeRate.value = response.data.value ?? []
    }
  }
</script>

<style lang="scss" scoped></style>
