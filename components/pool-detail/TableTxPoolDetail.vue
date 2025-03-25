<template>
  <div class="mt-[34px] rounded-lg bg-white pb-[18px] pt-8 shadow-md">
    <div class="flex items-center justify-between px-6 sm:mb-4 sm:flex-col sm:items-start sm:gap-5 sm:px-4">
      <span class="text-2xl font-semibold leading-7">Transactions</span>
      <BaseTab v-model:model="tabActive" :list="listTab" class="sm:pl-1" />
    </div>
    <BaseTable v-if="isDesktop" v-loading="isLoading" class="table-tx mt-[26px]" :data="dataTable">
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
              >({{ formatNumberWithDigits(row.amount0) }} {{ row.token0.symbol }}, {{ formatNumberWithDigits(row.amount1) }} {{ row.token1.symbol }})</span
            >
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="Account" align="right">
        <template #default="{ row }">
          <div class="text-success">{{ sliceString(row.origin, 8, 4) }}</div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="Time" align="right">
        <template #default="{ row }">
          <div class="pr-3">{{ useTimeAgo(row.timestamp, { showSecond: true }) }}</div>
        </template>
      </ElTableColumn>
    </BaseTable>
    <div v-else v-loading="isLoading" class="min-h-[200px]">
      <template v-if="dataTable.length === 0">
        <span class="flex h-[100px] items-center justify-center text-sm text-gray-6">There are no data</span>
      </template>
      <template v-else>
        <div v-for="item in dataTable" :key="item.id" class="flex justify-between gap-4 border-b border-solid border-gray-3 px-4 py-[10px] last:border-none">
          <div class="flex-1 flex-col">
            <a
              :href="getUrlScan(chainIdByNetwork, 'tx', item.id)"
              target="_blank"
              class="cursor-pointer text-sm font-semibold hover:text-hyperlink hover:underline"
              >{{ item.type }} {{ item.token0.symbol }} for {{ item.token1.symbol }}</a
            >
            <div class="text-xs">
              <span class="text-success">{{ sliceString(item.origin, 8, 4) }}</span>
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

  interface Pool {
    swaps: { transaction: { swaps: ITx[] } }[]
    mints: { transaction: { mints: ITx[] } }[]
    burns: { transaction: { burns: ITx[] } }[]
  }

  interface PoolsResponse {
    pools: Pool[]
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

  async function getPoolData(poolAddress: string) {
    try {
      const client = getGraphQLClient(props.pool.chainId)
      // Định nghĩa query với variable
      const query = gql`
        query MyQuery($poolAddress: String!) {
          pools(where: { id: $poolAddress }) {
            swaps {
              transaction {
                swaps {
                  id
                  timestamp
                  amountUSD
                  amount0
                  amount1
                  origin
                  token0 {
                    symbol
                  }
                  token1 {
                    symbol
                  }
                }
              }
            }
            mints {
              transaction {
                mints {
                  id
                  amount0
                  amount1
                  amountUSD
                  timestamp
                  token0 {
                    symbol
                  }
                  token1 {
                    symbol
                  }
                  origin
                }
              }
            }
            burns {
              transaction {
                burns {
                  id
                  amount0
                  amount1
                  amountUSD
                  timestamp
                  origin
                  token0 {
                    symbol
                  }
                  token1 {
                    symbol
                  }
                }
              }
            }
          }
        }
      `
      const variables = {
        poolAddress: poolAddress
      }
      const data = await client.request<PoolsResponse>(query, variables)

      return data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: computed(() => ['txs-pool', poolAddress]),
    queryFn: () => getPoolData(poolAddress),
    enabled: computed(() => !!poolAddress),
    retry: 2
  })

  const mintsData = computed(() => {
    return (
      data.value?.pools[0].mints.flatMap((m) => m.transaction.mints.map((item) => ({ ...item, type: TabValue.ADD, timestamp: item.timestamp * 1000 }))) || []
    )
  })

  const burnsData = computed(() => {
    return (
      data.value?.pools[0].burns.flatMap((m) => m.transaction.burns.map((item) => ({ ...item, type: TabValue.REMOVE, timestamp: item.timestamp * 1000 }))) || []
    )
  })

  const swapsData = computed(() => {
    return (
      data.value?.pools[0].swaps.flatMap((m) => m.transaction.swaps.map((item) => ({ ...item, type: TabValue.SWAP, timestamp: item.timestamp * 1000 }))) || []
    )
  })

  const allData = computed(() => {
    return [...mintsData.value, ...burnsData.value, ...swapsData.value]
  })

  const dataTable = computed(() => {
    switch (tabActive.value) {
      case TabValue.ALL:
        return allData.value
      case TabValue.SWAP:
        return swapsData.value
      case TabValue.ADD:
        return mintsData.value
      case TabValue.REMOVE:
        return burnsData.value
      default:
        return allData.value
    }
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
