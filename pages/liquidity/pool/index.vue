<template>
  <div class="mx-auto mb-[85px] mt-[38px] max-w-[1024px]">
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <h4 class="text-xl font-semibold">Liquidity Pools & Farms</h4>
        <p class="text-sm text-gray-8">
          Maximize earnings with secure and smart farming <span class="text-gray-4"> | </span>
          <span class="text-hyperlink">Learn how</span>
          <span class="text-gray-4"> | </span>
          <span class="text-hyperlink">FAQ</span>
        </p>
      </div>
      <div class="flex items-center gap-[50px]">
        <div class="flex gap-6 text-sm font-semibold text-gray-7">
          <NuxtLink to="/liquidity/pool">
            <BaseTab v-model:model="tabActive" :list="[{ title: 'All Pools', value: 'ALL' }]" />
          </NuxtLink>
          <NuxtLink to="/liquidity/positions">
            <span class="tab-active cursor-pointer pb-[10px] hover:text-hyperlink">My Position</span>
          </NuxtLink>
        </div>
        <NuxtLink to="/liquidity/add">
          <BaseButton size="sm" class="flex w-[149px] items-center gap-1 !text-white">
            <BaseIcon name="plus" size="24" />
            <span>Add Liquidity</span>
          </BaseButton>
        </NuxtLink>
      </div>
    </div>
    <div class="mt-[26px] rounded-lg bg-white py-8">
      <div class="flex items-center justify-between px-6">
        <h4 class="text-2xl font-semibold leading-7">All Pools</h4>
        <div class="flex gap-4">
          <ChooseNetwork v-model:network-selected="networkSelected" is-select>
            <template #reference>
              <div class="flex h-[42px] w-[280px] cursor-pointer items-center justify-between gap-1 rounded-lg border border-solid border-gray-4 pl-4 pr-1">
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
            class="flex h-[42px] w-[280px] cursor-pointer items-center justify-between gap-1 rounded-lg border border-solid border-gray-4 pl-4 pr-1"
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
        </div>
      </div>
      <TableListPool :data="formattedData" :loading="status === 'pending'" />
    </div>
  </div>
  <PopupSelectToken v-model:token-selected="tokenSelected" :show-network="false" is-select />
</template>

<script lang="ts" setup>
  import TableListPool from '~/components/liquidity/TableListPool.vue'
  import { LIST_NETWORK } from '~/constant'
  import type { IPool, IPoolOrigin } from '~/types/pool.type'
  import type { IResponse } from '~/types/response.type'

  definePageMeta({
    middleware: ['reset-form-liquidity-middleware', 'reset-all-popup-middleware']
  })

  const tabActive = ref<'ALL' | 'POSITION'>('ALL')

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

  // Compute the query string dynamically
  const queryString = computed(() => {
    const params = new URLSearchParams()
    networkListSelected.value.forEach((network) => params.append('networks', network.value))
    tokenListSelected.value.forEach((token) => params.append('tokens', token.symbol))
    return params.toString()
  })

  const { data, status } = useFetch<IResponse<IPoolOrigin[]>>(() => `/api/pool/list?${queryString.value}`, {
    immediate: true,
    key: queryString.value
  })

  const formattedData = computed((): IPool[] => {
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
          poolStatus: data.poolstatus,
          createdBy: data.createdby,
          currentTick: data.currenttick,
          baseQtty: data.baseqtty,
          quoteQtty: data.quoteqtty,
          tvl: data.tvl,
          volume24h: data.volume24h,
          feeApr: data.feeapr,
          rewardApr: data.rewardapr,
          liquidity: data.liquidity
        }
      })
    }
    return []
  })
</script>

<style lang="scss" scoped></style>
