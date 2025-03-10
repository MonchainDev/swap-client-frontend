<template>
  <div class="mt-[26px] rounded-lg bg-white py-8 shadow-md">
    <div class="flex items-center justify-between px-6">
      <h4 class="text-xl font-semibold">My positions</h4>
      <div class="flex items-center gap-5">
        <ChooseNetwork v-model:network-selected="networkSelected" is-select>
          <template #reference>
            <div class="flex h-[42px] w-[232px] cursor-pointer items-center justify-between gap-1 rounded-lg border border-solid border-gray-4 pl-4 pr-1">
              <div class="flex items-center gap-2">
                <div class="flex">
                  <template v-if="networkListSelected.length > 3">
                    <div class="flex">
                      <img
                        v-for="(_i, index) in 3"
                        :key="index"
                        :src="networkListSelected[index].logo"
                        alt="logo"
                        class="border-sky-500 size-6 rounded border-[2px] border-solid border-white [&:not(:first-child)]:-ml-3"
                      />
                      <div
                        class="-ml-3 flex size-6 items-center justify-center rounded border-[2px] border-solid border-white bg-[#CCE0FF] text-xs font-bold text-hyperlink"
                      >
                        +{{ networkListSelected.length - 3 }}
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <template v-for="item in networkListSelected" :key="item">
                      <img
                        :src="item.logo"
                        alt="logo"
                        class="border-sky-500 size-6 rounded border-[2px] border-solid border-white [&:not(:first-child)]:-ml-3"
                      />
                    </template>
                  </template>
                </div>
                <div class="line-clamp-1 flex-1 text-sm">{{ titleFilterNetwork }}</div>
              </div>
              <BaseIcon name="arrow-chevron" size="24" class="text-gray-6" />
            </div>
          </template>
        </ChooseNetwork>
        <div
          class="flex h-[42px] w-[170px] cursor-pointer items-center justify-between gap-1 rounded-lg border border-solid border-gray-4 pl-4 pr-1"
          @click="setOpenPopup('popup-select-token')"
        >
          <div class="flex items-center gap-2">
            <div class="flex">
              <template v-if="tokenListSelected.length > 3">
                <div class="flex">
                  <img
                    v-for="(_i, index) in 3"
                    :key="index"
                    :src="tokenListSelected[index].icon_url || ''"
                    alt="logo"
                    class="border-sky-500 size-6 rounded-full border-[2px] border-solid border-white [&:not(:first-child)]:-ml-3"
                    @error="handleImageError($event)"
                  />
                  <div
                    class="-ml-3 flex size-6 items-center justify-center rounded-full border-[2px] border-solid border-white bg-[#CCE0FF] text-xs font-bold text-hyperlink"
                  >
                    +{{ tokenListSelected.length - 3 }}
                  </div>
                </div>
              </template>
              <template v-else>
                <template v-for="item in tokenListSelected" :key="item">
                  <img
                    :src="item.icon_url || ''"
                    alt="logo"
                    class="border-sky-500 size-7 rounded-full border-[2px] border-solid border-white [&:not(:first-child)]:-ml-3"
                    @error="handleImageError($event)"
                  />
                </template>
              </template>
            </div>
            <div class="line-clamp-1 flex-1 text-sm">{{ titleFilterToken }}</div>
          </div>
          <BaseIcon name="arrow-chevron" size="24" class="text-gray-6" />
        </div>
        <BaseTab v-model:model="tabActive" :list="listTab" class="ml-6" />
      </div>
    </div>

    <div class="mt-9 grid h-11 grid-cols-[3fr,2fr,2fr,3fr,3fr,2fr] bg-[#FAFAFA]">
      <template v-for="item in listHeader" :key="item.title">
        <div class="flex items-center first:pl-6" :class="{ 'justify-center': item.align === 'center', 'justify-end': item.align === 'right' }">
          <span class="text-sm font-semibold text-gray-6">{{ item.title }}</span>
        </div>
      </template>
    </div>
    <template v-if="isConnected">
      <div v-loading="status === 'pending'" class="min-h-[100px]">
        <template v-if="status === 'success'">
          <template v-if="query.total > 0">
            <PositionItem v-for="item in formattedData" :key="item.tokenId.toString()" :position="item" />
            <BasePagination v-model:page="query.page" :total="query.total" class="mt-5 px-6" />
          </template>
          <template v-else>
            <div class="mx-auto flex h-[60px] items-center justify-center text-sm text-[#909399]">No Data</div>
          </template>
        </template>
      </div>
    </template>
    <template v-else>
      <div class="flex h-[100px] items-center justify-center text-base text-gray-6">There are no data</div>
    </template>
  </div>
  <PopupSelectToken v-model:token-selected="tokenSelected" :show-network="false" is-select />
</template>

<script lang="ts" setup>
  import { useAccount } from '@wagmi/vue'
  import { LIST_NETWORK } from '~/constant'
  import type { ITab } from '~/types/component.type'
  import type { IPosition, IPositionOrigin } from '~/types/position.type'
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
  const query = ref<{ page: number; pageSize: number; total: number }>({
    page: 1,
    pageSize: 20,
    total: 0
  })

  const { setOpenPopup } = useBaseStore()
  const { listToken } = storeToRefs(useBaseStore())

  const { handleImageError } = useErrorImage()

  const networkSelected = ref<string[]>(LIST_NETWORK.map((item) => item.value))
  const tokenSelected = ref<string[]>([])

  const networkListSelected = computed(() => {
    return LIST_NETWORK.filter((item) => networkSelected.value.includes(item.value))
  })
  const tokenListSelected = computed(() => {
    return listToken.value.filter((item) => tokenSelected.value.includes(item.address))
  })

  const titleFilterNetwork = computed(() => {
    return networkListSelected.value.length === LIST_NETWORK.length
      ? `All networks (${networkListSelected.value.length})`
      : networkListSelected.value.map((item) => item.title).join(', ')
  })

  const titleFilterToken = computed(() => {
    return tokenListSelected.value.length === 0 ? 'All tokens' : tokenListSelected.value.map((item) => item.symbol).join(', ')
  })
  // const chainIds = ref([16789])
  // const { data, isPending } = useAccountV3Positions(chainIds)

  const queryString = computed(() => {
    // const poolStatus = tabActive.value === TabValue.ALL ? '' : tabActive.value
    const params = new URLSearchParams()
    networkListSelected.value.forEach((network) => params.append('networks', network.value))
    tokenListSelected.value.forEach((token) => params.append('tokens', token.symbol === 'MON' ? 'WMON' : token.symbol))
    // params.append('poolStatus', poolStatus)
    params.append('page', query.value.page.toString())
    params.append('pageSize', query.value.pageSize.toString())
    params.append('createdBy', address.value?.toLowerCase() ?? '')
    return params.toString()
  })

  const { data, status } = await useFetch<IResponse<IPositionOrigin[]>>(() => `/api/position/list?${queryString.value}`, {
    key: queryString.value,
    immediate: true,
    onResponse: ({ response }) => {
      query.value.total = response._data.totalElements ?? 0
    }
  })

  const formattedData = computed((): IPosition[] => {
    if (data.value?.content.length) {
      //@ts-ignore
      return data.value.content.map((data) => {
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
          quoteQuantity: data.quoteqtty
        }
      })
    }
    return []
  })
</script>

<style lang="scss"></style>
