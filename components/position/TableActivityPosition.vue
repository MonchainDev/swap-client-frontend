<template>
  <ClientOnly>
    <div class="mt-6 rounded-lg bg-white pb-6 shadow-md">
      <span class="block pl-6 pt-8 text-2xl font-semibold leading-7 sm:px-4 sm:text-base">History</span>
      <BaseTable v-if="isDesktop" max-height="500" :data="dataTxs" :loading="loadingTxs" class="table-history mt-[26px]">
        <ElTableColumn label="Timestamp">
          <template #default="{ row }">
            <a :href="getUrlScan(chainId, 'tx', row.id)" target="_blank" class="cursor-pointer hover:text-hyperlink hover:underline">{{
              useDateFormat(row.timestamp * 1000, 'MM/DD/YYYY h:mm:ss A')
            }}</a>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Action">
          <template #default="{ row }">
            {{ getTran(row.type) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="Token Transferred" align="right">
          <template #default="{ row }">
            <span class="font-semibold">{{ getTokenTransferred(row) }}</span>
          </template>
        </ElTableColumn>
      </BaseTable>
      <div v-else v-loading="loadingTxs" class="min-h-[200px] sm:mt-3">
        <template v-if="dataTxs.length === 0">
          <span class="flex h-[100px] items-center justify-center text-sm text-gray-6">There are no data</span>
        </template>
        <template v-else>
          <ElScrollbar max-height="500" always>
            <div v-for="item in dataTxs" :key="item.id" class="flex justify-between gap-4 border-b border-solid border-gray-3 px-4 py-[10px] last:border-none">
              <div class="flex flex-col gap-1">
                <span class="text-sm font-medium"> {{ getTran(item.type) }}</span>
                <span class="text-xs text-gray-7">{{ useDateFormat(+item.timestamp * 1000, 'MM/DD/YYYY h:mm:ss A') }}</span>
              </div>
              <span class="flex-1 break-all text-right font-semibold">{{ getTokenTransferred(item) }}</span>
            </div>
          </ElScrollbar>
        </template>
      </div>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
  import type { Token } from '@monchain/swap-sdk-core'
  import type { ITx } from '~/pages/liquidity/[network]/[tokenId].vue'

  const enum TabValue {
    COLLECT = 'COLLECT',
    SWAP = 'SWAP',
    ADD = 'ADD',
    REMOVE = 'REMOVE'
  }

  interface IProps {
    dataTxs: ITx[]
    loadingTxs: boolean
    token0: Token | undefined
    token1: Token | undefined
  }

  const props = withDefaults(defineProps<IProps>(), {
    dataTxs: () => [],
    loadingTxs: false,
    token0: undefined,
    token1: undefined
  })

  const { isDesktop } = useDesktop()

  const { chainId } = useActiveChainId()

  const getTran = (type: TabValue | string) => {
    switch (type) {
      case TabValue.ADD:
        return 'Add Liquidity'
      case TabValue.REMOVE:
        return 'Remove Liquidity'
      case TabValue.SWAP:
        return 'Swap'
      case TabValue.COLLECT:
        return 'Collect fee'
      default:
        return ''
    }
  }

  const getTokenTransferred = (row: ITx) => {
    const amount0 = formatNumberWithDigits(row.amount0, 2)
    const amount1 = formatNumberWithDigits(row.amount1, 2)
    if (row.type === 'ADD' || row.type === 'COLLECT') {
      return `+${amount0} ${props.token0?.symbol}, +${amount1} ${props.token1?.symbol}`
    } else if (row.type === 'SWAP') {
      if (parseFloat(row.amount0) > 0) {
        return `+${amount0} ${props.token0?.symbol}, ${amount1} ${props.token1?.symbol}`
      } else {
        return `${amount0} ${props.token0?.symbol}, +${amount1} ${props.token1?.symbol}`
      }
    } else {
      return `-${amount0} ${props.token0?.symbol}, -${amount1} ${props.token1?.symbol}`
    }
  }
</script>

<style lang="scss" scoped>
  .table-history {
    :deep(.el-table) {
      .el-table__header {
        tr th:first-child {
          padding-left: 12px;
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
