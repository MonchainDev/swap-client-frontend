<template>
  <div class="mt-[34px] rounded-lg bg-white pb-[18px] pt-8 shadow-md">
    <div class="flex items-center justify-between px-6">
      <span class="text-2xl font-semibold leading-7">Transactions</span>
      <BaseTab v-model:model="tabActive" :list="listTab" />
    </div>
    <BaseTable class="table-tx mt-[26px]" :data="[]">
      <ElTableColumn label="Tran." />
      <ElTableColumn label="Value" align="right" />
      <ElTableColumn label="Account" align="right" />
      <ElTableColumn label="Time" align="right" />
    </BaseTable>
  </div>
</template>

<script lang="ts" setup>
  import type { ITab } from '~/types/component.type'
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

  const tabActive = ref<TabValue>(TabValue.ALL)

  const { address: poolAddress, network } = useRoute('info-network-address').params

  const { data: _data } = useFetch(`/api/transaction/list`, { query: { network: network?.toUpperCase(), poolAddress } })
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
