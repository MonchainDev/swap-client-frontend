<template>
  <ClientOnly>
    <div v-if="isDesktop" class="mt-[26px] rounded-lg bg-white py-8 shadow-md">
      <div class="flex items-center justify-between px-6">
        <h4 class="text-xl font-semibold">My positions</h4>
        <div class="flex items-center gap-5">
          <ChooseNetwork v-model:network-selected="networkSelected" is-select @change="query.page = 1">
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
            @click="setOpenPopup('popup-selected-token-multiple')"
          >
            <div class="flex items-center gap-2">
              <div class="flex">
                <template v-if="tokenSelected.length > 3">
                  <div class="flex">
                    <img
                      v-for="(_i, index) in 3"
                      :key="index"
                      :src="tokenSelected[index].icon_url || ''"
                      alt="logo"
                      class="border-sky-500 size-6 rounded-full border-[2px] border-solid border-white [&:not(:first-child)]:-ml-3"
                      @error="handleImageError($event)"
                    />
                    <div
                      class="-ml-3 flex size-6 items-center justify-center rounded-full border-[2px] border-solid border-white bg-[#CCE0FF] text-xs font-bold text-hyperlink"
                    >
                      +{{ tokenSelected.length - 3 }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <template v-for="item in tokenSelected" :key="item">
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
          <BaseTab v-model:model="tabActive" :list="listTab" class="ml-6" @update:model="query.page = 1" />
        </div>
      </div>

      <div class="mt-9 grid h-11 grid-cols-[4fr,80px,136px,3fr,3fr,180px] bg-[#FAFAFA]">
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
              <PositionItem
                v-for="item in formattedData"
                :key="item.tokenId.toString()"
                :position="item"
                :list-exchange-rate="listExchangeRate"
                @unstake="
                  (pos, price) => {
                    positionCurrent = pos
                    positionCurrent.priceUdtTotal = price
                    setOpenPopup('popup-unstake')
                  }
                "
                @reload="refresh"
              />
              <BasePagination v-if="query.total > 20" v-model:page="query.page" :total="query.total" class="mt-5 px-6" />
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
    <template v-else>
      <BlockLiquidHeaderMobile v-model:network-selected="networkSelected" :token-selected="tokenSelected" @change="query.page = 1" />
      <BaseTab v-model:model="tabActive" :list="listTab" class="bg-white pl-6 pt-4" @update:model="query.page = 1" />

      <template v-if="isConnected">
        <div v-loading="status === 'pending'" class="mt-6 space-y-4 px-4">
          <template v-if="formattedData.length">
            <MyPositionItem
              v-for="item in formattedData"
              :key="item.tokenId"
              :list-exchange-rate="listExchangeRate"
              :position="item"
              class="rounded-lg bg-white p-4 first:!pt-4"
              @reload="refresh"
              @unstake="
                (pos, price) => {
                  positionCurrent = pos
                  positionCurrent.priceUdtTotal = price
                  setOpenPopup('popup-unstake')
                }
              "
            />
          </template>
          <template v-else>
            <div class="items2-center flex h-full justify-center rounded-lg bg-gray-1">
              <BaseIcon name="trash" size="80" />
            </div>
          </template>
        </div>
      </template>
      <template v-else>
        <div class="flex h-[100px] items-center justify-center text-base text-gray-6">There are no data</div>
      </template>
    </template>
  </ClientOnly>

  <PopupSelectTokenMultiple
    :network-selected="networkListSelected"
    :token-selected="tokenSelected"
    @change="handleSelectToken"
    @remove-all="
      () => {
        query.page = 1
        tokenSelected = []
      }
    "
  />
  <PopupUnStake :position="positionCurrent" @reload="refresh" />
</template>

<script lang="ts" setup>
  import { useAccount } from '@wagmi/vue'
  import { LIST_NETWORK } from '~/config/networks'
  import type { ITab } from '~/types/component.type'
  import type { IPosition, IPositionOrigin } from '~/types/position.type'
  import type { IResponse } from '~/types/response.type'
  import PopupUnStake from './PopupUnStake.vue'
  import type { ChainId, IExchangeRate, IToken } from '~/types'
  import { WNATIVE } from '~/config/tokens'
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

  const { isDesktop } = useDesktop()
  const tabActive = ref<TabValue>(TabValue.ALL)

  const { isConnected, address } = useAccount()
  const query = ref<{ page: number; pageSize: number; total: number }>({
    page: 1,
    pageSize: 20,
    total: 0
  })

  const { setOpenPopup } = useBaseStore()

  const { handleImageError } = useErrorImage()

  const networkSelected = ref<string[]>(LIST_NETWORK.map((item) => item.network))
  const tokenSelected = ref<IToken[]>([])
  const positionCurrent = ref<IPosition | undefined>(undefined)

  watchEffect(() => {
    // reset token selected when change network
    if (networkSelected.value.length) {
      tokenSelected.value = []
    }
  })

  const networkListSelected = computed(() => {
    return LIST_NETWORK.filter((item) => networkSelected.value.includes(item.network))
  })

  const titleFilterNetwork = computed(() => {
    return networkListSelected.value.length === LIST_NETWORK.length
      ? `All networks (${networkListSelected.value.length})`
      : networkListSelected.value.map((item) => item.name).join(', ')
  })

  const titleFilterToken = computed(() => {
    return tokenSelected.value?.length === 0 ? 'All tokens' : tokenSelected.value?.map((item) => item.tokenSymbol).join(', ')
  })
  // const chainIds = ref([16789])
  // const { data, isPending } = useAccountV3Positions(chainIds)

  const queryString = computed(() => {
    const params = new URLSearchParams()
    if (tabActive.value !== 'ALL') {
      params.append('status', tabActive.value)
    }
    networkListSelected.value.forEach((network) => params.append('networks', network.network))
    tokenSelected.value?.forEach((token) => {
      const address =
        token.tokenAddress === '' || token.tokenAddress.toLowerCase() === zeroAddress ? WNATIVE[token.chainId as ChainId].address : token.tokenAddress
      params.append('tokens', address)
    })

    params.append('page', query.value.page.toString())
    params.append('pageSize', query.value.pageSize.toString())
    params.append('createdBy', address.value?.toLowerCase() ?? '')
    return params.toString()
  })

  const { data, status, refresh } = await useLazyFetch<IResponse<IPositionOrigin[]>>(() => `/api/position/list/search?${queryString.value}`, {
    key: queryString.value,
    immediate: isConnected.value,
    onResponse: ({ response }) => {
      query.value.total = response._data.totalElements ?? 0
      if (response._data?.content.length) {
        const baseSymbols = response._data?.content.map((item: IPositionOrigin) => item.basesymbol)
        const quoteSymbols = response._data?.content.map((item: IPositionOrigin) => item.quotesymbol)
        const listSymbols = [...baseSymbols, ...quoteSymbols]
        const listUnique = Array.from(new Set(listSymbols))
        fetchExchangeRate(listUnique)
      }
    }
  })

  const formattedData = computed((): IPosition[] => {
    console.log(data.value)

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
          feeApr: data.feeapr ?? 0,
          rewardApr: data.rewardapr ?? 0,
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

  const listExchangeRate = ref<IExchangeRate[]>([])
  const fetchExchangeRate = async (currencies: string[]) => {
    console.log('🚀 ~ fetchExchangeRate ~ currencies:', currencies)
    const params = new URLSearchParams()
    if (currencies.length) {
      currencies.forEach((currency) => params.append('currencies', currency))
      const response = await useFetch<IExchangeRate[]>(`/api/exchange-rate/all?${params.toString()}`)
      listExchangeRate.value = response.data.value ?? []
    }
  }

  const handleSelectToken = (token: IToken, type: 'add' | 'remove') => {
    query.value.page = 1
    if (type === 'add') {
      const index = tokenSelected.value.findIndex((item) => item.id === token.id)
      if (index === -1) {
        tokenSelected.value.push(token)
      } else {
        tokenSelected.value = tokenSelected.value.filter((item) => item.id !== token.id)
      }
    } else {
      tokenSelected.value = tokenSelected.value.filter((item) => item.id !== token.id)
    }
  }
</script>

<style lang="scss"></style>
