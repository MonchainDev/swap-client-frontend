<template>
  <div class="mt-[34px] rounded-lg bg-white pb-[18px] pt-8 shadow-md">
    <div class="flex items-center justify-between px-6">
      <span class="text-2xl font-semibold leading-7">Transactions</span>
      <BaseTab v-model:model="tabActive" :list="listTab" />
    </div>
    <BaseTable class="table-tx mt-[26px]" :data="data ?? []">
      <ElTableColumn label="Tran.">
        <template #default="{ row }">
          <ColTrans :row="row" />
        </template>
      </ElTableColumn>

      <ElTableColumn label="Value" align="right" />
      <ElTableColumn label="Account" align="right">
        <template #default="{ row }">
          <div class="text-success">{{ sliceString(row.fromAddress, 8, 4) }}</div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="Time" align="right">
        <template #default="{ row }">
          <div class="pr-3">{{ useTimeAgo(row.createdAt, { showSecond: true }) }}</div>
        </template>
      </ElTableColumn>
    </BaseTable>
  </div>
</template>

<script lang="ts" setup>
  import type { ITab } from '~/types/component.type'
  import type { IPool } from '~/types/pool.type'
  import type { ITransaction } from '~/types/transaction.type'
  const enum TabValue {
    ALL = 'ALL',
    SWAP = 'SWAP',
    ADD = 'ADD',
    REMOVE = 'REMOVE'
  }

  // const route = useRoute('liquidity-pool-network-address')

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

  const _props = withDefaults(defineProps<IProps>(), {
    pool: () => ({}) as IPool
  })

  const tabActive = ref<TabValue>(TabValue.ALL)

  const { address: poolAddress, network } = useRoute('info-network-address').params

  /**
   * TODO: Get token symbol, amount base / quote
   */
  const { data } = useFetch<ITransaction[]>(`/api/transaction/list`, { query: { network: network?.toUpperCase(), poolAddress } })

  // const getAmount = (row: ITransaction) => {
  //   const baseToken = listToken.value.find((token) => token.address?.toLocaleLowerCase() === row.fromToken.toLocaleLowerCase())

  // }
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
