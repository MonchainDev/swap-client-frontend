<template>
  <div class="mt-5 rounded-lg bg-white px-6 py-8 shadow-md">
    <div class="flex items-center justify-between">
      <h4 class="text-xl font-semibold">My positions</h4>
      <BaseTab v-model:model="tabActive" :list="listTab" />
    </div>

    <div class="mt-[22px] flex flex-col">
      <div class="grid h-11 grid-cols-[3fr,2fr,2fr,3fr,3fr,2fr] bg-[#FAFAFA]">
        <template v-for="item in listHeader" :key="item.title">
          <div class="flex items-center" :class="{ 'justify-center': item.align === 'center', 'justify-end': item.align === 'right' }">
            <span class="text-sm font-semibold text-gray-6">{{ item.title }}</span>
          </div>
        </template>
      </div>
      <template v-if="!isConnected">
        <div v-loading="status === 'pending'" class="min-h-[100px]">
          <template v-if="status === 'success'">
            <PositionItem v-for="item in formattedData" :key="item.tokenId.toString()" :position="item" />
          </template>
        </div>
      </template>
      <template v-else>
        <div class="flex h-[100px] items-center justify-center text-base text-gray-6">There are no data</div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useAccount } from '@wagmi/vue'
  import type { ITab } from '~/types/component.type'
  import type { IPool } from '~/types/pool.type'
  import type { IResponse } from '~/types/response.type'
  const enum TabValue {
    ALL = 'ALL',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    CLOSE = 'CLOSE'
  }

  const listTab: ITab[] = [
    { title: 'All', value: TabValue.ALL },
    { title: 'Active', value: TabValue.ACTIVE },
    { title: 'Inactive', value: TabValue.INACTIVE },
    { title: 'Closed', value: TabValue.CLOSE }
  ]
  const listHeader = [
    {
      title: 'Pools',
      align: 'left'
    },
    {
      title: 'Fee tier',
      align: 'center'
    },
    {
      title: 'APR',
      align: 'center'
    },
    {
      title: 'Min/Max',
      align: 'left'
    },
    {
      title: 'Amounts',
      align: 'left'
    },
    {
      title: 'Status',
      align: 'center'
    }
  ]

  const tabActive = ref<TabValue>(TabValue.ALL)

  const { isConnected, address } = useAccount()
  const query = ref<{ page: number; pageSize: number }>({
    page: 1,
    pageSize: 20
  })
  // const chainIds = ref([16789])
  // const { data, isPending } = useAccountV3Positions(chainIds)

  const queryString = computed(() => {
    const poolStatus = tabActive.value === TabValue.ALL ? '' : tabActive.value
    return `page=${query.value.page}&pageSize=${query.value.pageSize}&networks=MON&createdBy=${address.value ?? ''}&poolStatus=${poolStatus}`
  })

  const { data, status } = useFetch<IResponse<string[]>>(() => `/api/pool/list?${queryString.value}`, {
    immediate: true,
    key: queryString.value
  })

  const formattedData = computed((): IPool[] => {
    if (data.value?.content.length) {
      //@ts-ignore
      return data.value.content.map((data) => {
        return {
          poolAddress: data[0],
          tokenBase: data[1],
          tokenQuote: data[2],
          baseSymbol: data[3],
          quoteSymbol: data[4],
          fee: data[5],
          network: data[6],
          tickLower: data[7],
          priceLower: data[8],
          tickUpper: data[9],
          priceUpper: data[10],
          tokenId: data[11],
          baseDecimals: data[12],
          quoteDecimals: data[13],
          poolStatus: data[14],
          createdBy: data[15],
          currentTick: data[16],
          baseQtty: data[17],
          quoteQtty: data[18],
          tvl: data[19],
          volume24h: data[20],
          feeApr: data[21],
          rewardApr: data[22],
          liquidity: data[23]
        }
      })
    }
    return []
  })
</script>

<style lang="scss"></style>
