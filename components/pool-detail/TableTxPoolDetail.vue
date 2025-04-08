<template>
  <div class="mt-[34px] rounded-lg bg-white pb-[18px] pt-8 shadow-md">
    <div class="flex items-center justify-between px-6 sm:mb-4 sm:flex-col sm:items-start sm:gap-5 sm:px-4">
      <span class="text-2xl font-semibold leading-7">Transactions</span>
      <BaseTab v-model:model="tabActive" :list="listTab" class="sm:pl-1" />
    </div>
    <template v-if="isDesktop">
      <BaseTable v-loading="isLoading || isRefetching" class="table-tx mt-[26px]" :data="flattenedTransactions">
        <ElTableColumn label="Tran.">
          <template #default="{ row }">
            <a
              :href="getUrlScan(chainIdByNetwork, 'tx', row.id)"
              target="_blank"
              class="cursor-pointer text-sm font-semibold hover:text-hyperlink hover:underline"
              >{{ row.type }} {{ row.token0.symbol }} for {{ row.token1.symbol }}</a
            >
          </template>
        </ElTableColumn>

        <ElTableColumn label="Value" align="right">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-semibold"> ${{ formatNumberWithDigits(row.amountUSD) }}</span>
              <span class="text-gray-6"
                >({{ formatNumberWithDigits(Math.abs(row.amount0)) }} {{ row.token0.symbol }}, {{ formatNumberWithDigits(Math.abs(row.amount1)) }}
                {{ row.token1.symbol }})</span
              >
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Account" align="right">
          <template #default="{ row }">
            <a :href="getUrlScan(chainIdByNetwork, 'address', row.origin)" target="_blank" class="cursor-pointer text-success hover:underline">{{
              sliceString(row.origin, 8, 4)
            }}</a>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Time" align="right">
          <template #default="{ row }">
            <div class="pr-3">{{ useTimeAgo(row.timestamp, { showSecond: true }) }}</div>
          </template>
        </ElTableColumn>
      </BaseTable>
      <div v-if="tabActive !== TabValue.ALL && flattenedTransactions.length" class="mt-5 flex justify-end space-x-4 pr-4">
        <button
          class="solid flex items-center gap-1 rounded-lg border border-gray-3 px-4 py-2 text-sm hover:border-hyperlink"
          :class="{ 'pointer-events-none bg-gray-3': !skip }"
          @click="handleSkipChange('BACK')"
        >
          Back
        </button>
        <button
          class="solid flex items-center gap-1 rounded-lg border border-gray-3 px-4 py-2 text-sm hover:border-hyperlink"
          :class="{ 'pointer-events-none bg-gray-3': flattenedTransactions.length < first }"
          @click="handleSkipChange('NEXT')"
        >
          Next
        </button>
      </div>
    </template>
    <div v-else v-loading="isLoading || isRefetching" class="min-h-[200px]">
      <template v-if="flattenedTransactions.length === 0">
        <span class="flex h-[100px] items-center justify-center text-sm text-gray-6">There are no data</span>
      </template>
      <template v-else>
        <div
          v-for="item in flattenedTransactions"
          :key="item.id"
          class="flex justify-between gap-4 border-b border-solid border-gray-3 px-4 py-[10px] last:border-none"
        >
          <div class="flex-1 flex-col">
            <a
              :href="getUrlScan(chainIdByNetwork, 'tx', item.id)"
              target="_blank"
              class="cursor-pointer text-sm font-semibold hover:text-hyperlink hover:underline"
              >{{ item.type }} {{ item.token0.symbol }} for {{ item.token1.symbol }}</a
            >
            <div class="text-xs">
              <a :href="getUrlScan(chainIdByNetwork, 'address', item.origin)" target="_blank" class="text-success">{{ sliceString(item.origin, 8, 4) }}</a>
              <span class="px-1 text-gray-4">|</span>
              <span>
                <span class="font-semibold text-gray-7">${{ formatNumberWithDigits(item.amountUSD) }}</span>
                <span class="text-gray-6"
                  >({{ formatNumberWithDigits(item.amount0) }} {{ item.token0.symbol }}, {{ formatNumberWithDigits(item.amount1) }}
                  {{ item.token1.symbol }})</span
                >
              </span>
            </div>
          </div>
          <span class="text-sm">{{ useTimeAgo(item.timestamp, { showSecond: true }) }}</span>
        </div>
        <div v-if="tabActive !== TabValue.ALL && flattenedTransactions.length" class="mt-5 flex justify-center space-x-4 pr-4">
          <button
            class="solid flex items-center gap-1 rounded-lg border border-gray-3 px-4 py-2 text-sm"
            :class="{ 'pointer-events-none bg-gray-3': !skip }"
            @click="handleSkipChange('BACK')"
          >
            Back
          </button>
          <button
            class="solid flex items-center gap-1 rounded-lg border border-gray-3 px-4 py-2 text-sm"
            :class="{ 'pointer-events-none bg-gray-3': flattenedTransactions.length < first }"
            @click="handleSkipChange('NEXT')"
          >
            Next
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useQuery } from '@tanstack/vue-query'
  import { gql } from 'graphql-request'
  import { LIST_NETWORK } from '~/config/networks'
  import type { ChainId } from '~/types'
  import type { ITab } from '~/types/component.type'
  import type { IPool } from '~/types/pool.type'

  interface ITx {
    id: string
    amount0: string
    amount1: string
    amountUSD: string
    timestamp: number
    origin: string
    token0: { symbol: string }
    token1: { symbol: string }
    type: TabValue.ADD | TabValue.REMOVE | TabValue.SWAP
  }

  interface ITxs {
    swaps: ITx[]
    mints: ITx[]
    burns: ITx[]
  }

  interface PoolsResponse {
    transactions: ITxs[]
  }

  const enum TabValue {
    ALL = 'ALL',
    SWAP = 'SWAP',
    ADD = 'ADD',
    REMOVE = 'REMOVE'
  }

  const listTab: ITab[] = [
    {
      title: 'All',
      value: 'ALL'
    },
    {
      title: 'Swap',
      value: 'SWAP'
    },
    {
      title: 'Add',
      value: 'ADD'
    },
    {
      title: 'Remove',
      value: 'REMOVE'
    }
  ]

  interface IProps {
    pool: IPool
  }

  const props = withDefaults(defineProps<IProps>(), {
    pool: () => ({}) as IPool
  })

  const tabActive = ref<TabValue>(TabValue.ALL)

  const { isDesktop } = storeToRefs(useBaseStore())

  const { address: poolAddress, network: networkPoolInfo } = useRoute('info-network-address').params

  const { network: networkPoolDetail } = useRoute('liquidity-pool-network-address').params

  const chainIdByNetwork = computed(() => {
    const networkUrl = networkPoolInfo || networkPoolDetail
    const chainId = LIST_NETWORK.find((item) => item.network.toUpperCase() === networkUrl.toUpperCase())?.chainId
    return chainId as ChainId
  })

  // /**
  //  * TODO: Get token symbol, amount base / quote
  //  */
  // const { data } = useFetch<ITransaction[]>(`/api/transaction/list`, { query: { network: network?.toUpperCase(), poolAddress } })

  // // const getAmount = (row: ITransaction) => {
  // //   const baseToken = listToken.value.find((token) => token.address?.toLocaleLowerCase() === row.fromToken.toLocaleLowerCase())

  // // }

  // Các queries riêng biệt
  const ALL_QUERY = gql`
    query AllTransactions($poolAddress: String!) {
      transactions(
        where: { or: [{ mints_: { pool: $poolAddress } }, { burns_: { pool: $poolAddress } }, { swaps_: { pool: $poolAddress } }] }
        orderBy: timestamp
        orderDirection: desc
      ) {
        burns {
          origin
          amount0
          amount1
          amountUSD
          id
          token0 {
            symbol
          }
          token1 {
            symbol
          }
          timestamp
        }
        mints {
          origin
          amount0
          amount1
          amountUSD
          id
          token0 {
            symbol
          }
          token1 {
            symbol
          }
          timestamp
        }
        swaps {
          origin
          amount0
          amount1
          amountUSD
          id
          token0 {
            symbol
          }
          token1 {
            symbol
          }
          timestamp
        }
      }
    }
  `
  const SWAP_QUERY = gql`
    query AllTransactions($poolAddress: String!, $skip: Int = 0) {
      transactions(where: { swaps_: { pool: $poolAddress } }, orderBy: timestamp, orderDirection: desc, skip: $skip, first: 10) {
        swaps {
          origin
          amount0
          amount1
          amountUSD
          id
          token0 {
            symbol
          }
          token1 {
            symbol
          }
          timestamp
        }
      }
    }
  `
  const ADD_QUERY = gql`
    query AllTransactions($poolAddress: String!, $skip: Int = 0) {
      transactions(where: { mints_: { pool: $poolAddress } }, orderBy: timestamp, orderDirection: desc, skip: $skip, first: 10) {
        mints {
          origin
          amount0
          amount1
          amountUSD
          id
          token0 {
            symbol
          }
          token1 {
            symbol
          }
          timestamp
        }
      }
    }
  `
  const REMOVE_QUERY = gql`
    query AllTransactions($poolAddress: String!, $skip: Int = 0) {
      transactions(where: { burns_: { pool: $poolAddress } }, orderBy: timestamp, orderDirection: desc, skip: $skip, first: 10) {
        burns {
          origin
          amount0
          amount1
          amountUSD
          id
          token0 {
            symbol
          }
          token1 {
            symbol
          }
          timestamp
        }
      }
    }
  `

  const getQuery = () => {
    switch (tabActive.value) {
      case TabValue.SWAP:
        return SWAP_QUERY
      case TabValue.ADD:
        return ADD_QUERY
      case TabValue.REMOVE:
        return REMOVE_QUERY
      default:
        return ALL_QUERY
    }
  }

  const skip = ref(0)
  const first = 10

  async function getPoolData(poolAddress: string) {
    try {
      const client = getGraphQLClient(props.pool.chainId)
      // Định nghĩa query với variable
      const query = getQuery()
      const variables = {
        poolAddress: poolAddress,
        skip: skip.value
      }
      const data = await client.request<PoolsResponse>(query, variables)
      console.log('🚀 ~ getPoolData ~ data:', data)

      return data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: computed(() => ['txs-pool', poolAddress]),
    queryFn: () => getPoolData(poolAddress),
    enabled: computed(() => !!poolAddress),
    retry: 2
  })

  const handleSkipChange = (type: 'BACK' | 'NEXT') => {
    if (type === 'BACK') {
      skip.value = skip.value === 0 ? 0 : skip.value - first
    } else {
      skip.value += first
    }
    refetch()
  }

  watch(
    () => tabActive.value,
    () => {
      skip.value = 0
      refetch()
    }
  )

  // Logic làm phẳng dữ liệu
  const flattenedTransactions = computed(() => {
    if (!data.value?.transactions.length || !data.value?.transactions) return []
    const txs: ITx[] = []
    // Xử lý mints
    data.value.transactions.forEach((item) => {
      if (item?.mints && item.mints.length) {
        item.mints.forEach((mint) => {
          txs.push({
            ...mint,
            type: TabValue.ADD,
            timestamp: mint.timestamp * 1000
          })
        })
      }
      if (item?.burns && item.burns.length) {
        item.burns.forEach((burn) => {
          txs.push({
            ...burn,
            type: TabValue.REMOVE,
            timestamp: burn.timestamp * 1000
          })
        })
      }
      if (item?.swaps && item.swaps.length) {
        item.swaps.forEach((swap) => {
          txs.push({
            ...swap,
            type: TabValue.SWAP,
            timestamp: swap.timestamp * 1000
          })
        })
      }
    })
    return txs
  })
</script>

<style lang="scss" scoped>
  .table-tx {
    :deep(.el-table) {
      .el-table__header {
        tr th:first-child {
          padding-left: 12px;
        }
        tr th:last-child {
          padding-right: 12px;
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
