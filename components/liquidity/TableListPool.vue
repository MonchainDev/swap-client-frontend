<template>
  <BaseTable :data="props.data" :loading="loading" class="table-pool mt-9">
    <ElTableColumn label="Pools" width="320" prop="poolAddress">
      <template #default="{ row }">
        <NuxtLink :to="{ name: 'liquidity-pool-network-address', params: { network: row.network, address: row.poolAddress } }" class="flex gap-[10px]">
          <div class="flex">
            <img src="/token-default.png" alt="logo" class="size-9" />
            <img src="/token-default.png" alt="logo" class="-ml-[18px] size-9" />
          </div>
          <div class="flex flex-1 flex-col">
            <span class="text-base font-semibold">{{ row.baseSymbol }} / {{ row.quoteSymbol }}</span>
            <div class="flex items-center gap-1">
              <img :src="getNetwork(row.network)?.logo" alt="logo" class="h-[14px] w-[14px]" />
              <span class="text-xs text-gray-8">{{ getNetwork(row.network)?.name }}</span>
            </div>
          </div>
        </NuxtLink>
      </template>
    </ElTableColumn>
    <ElTableColumn label="Fee tier" align="center" width="100">
      <template #default="{ row }">
        <div class="mx-auto flex h-8 w-[55px] items-center justify-center rounded-md bg-[#F5F5F5] text-sm font-semibold">{{ row.fee / 10000 }}%</div>
      </template>
    </ElTableColumn>
    <ElTableColumn label="APR">
      <template #default="{ row }">
        <AprView :farm-apr="row.rewardApr" :lp-fee-apr="row.feeApr" :old-farm-apr="row.lastApr">
          <div class="text-sm text-[#049C6B]">
            Up to {{ formatNumber((Number(row.feeApr ?? 0) + Number(row.rewardApr ?? 0)).toFixed(2)) }}%
            <span class="text-gray-6"> {{ formatNumber(row.lastApr.toFixed(2)) }}%</span>
          </div>
        </AprView>
      </template>
    </ElTableColumn>
    <ElTableColumn label="TVL" align="right">
      <template #default="{ row }">
        <span class="text-sm">${{ formatDollar(row.tvl) }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn label="Volume 24h" align="right">
      <template #default="{ row }">
        <span class="text-sm">${{ formatDollar(row.volume24h) }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn label="" align="center" width="50">
      <template #default="{ row }">
        <ElPopover placement="right" :show-arrow="false" :width="200" trigger="hover" popper-class="popper-menu-pool">
          <template #reference>
            <BaseIcon name="three-dot" size="24" class="cursor-pointer" />
          </template>
          <ul class="flex flex-col gap-4">
            <li class="flex items-center gap-2 hover:text-hyperlink">
              <BaseIcon name="info" size="24" />
              <NuxtLink :to="{ name: 'liquidity-pool-network-address', params: { network: row.network, address: row.poolAddress } }">
                View pool details
              </NuxtLink>
            </li>
            <li v-if="!isConnected" class="flex cursor-pointer items-center gap-2 hover:text-hyperlink" @click="setOpenPopup('popup-connect')">
              <BaseIcon name="wallet-1" size="24" />
              <span>Connect Wallet </span>
            </li>
            <li class="flex items-center gap-2 hover:text-hyperlink">
              <BaseIcon name="article" size="24" />
              <NuxtLink :to="{ name: 'info-network-address', params: { network: row.network, address: row.poolAddress } }">
                <span>View Info page</span>
              </NuxtLink>
            </li>
          </ul>
        </ElPopover>
      </template>
    </ElTableColumn>
  </BaseTable>
</template>

<script lang="ts" setup>
  import { useAccount } from '@wagmi/vue'
  import { LIST_NETWORK } from '~/config/networks'
  import type { IPool } from '~/types/pool.type'

  interface IProps {
    data: IPool[] | undefined
    loading: boolean
  }

  const props = withDefaults(defineProps<IProps>(), {
    data: () => [],
    loading: false
  })

  const { setOpenPopup } = useBaseStore()
  const { isConnected } = useAccount()

  const getNetwork = (networkName: string) => {
    return LIST_NETWORK.find((item) => item.network === networkName)
  }

  const formatDollar = (tvl: number | string) => {
    const value = parseFloat(tvl.toString()) >= 1 ? parseFloat(tvl.toString()).toFixed(2) : tvl
    return formatNumberAbbreviation(+value)
  }
</script>

<style lang="scss" scoped>
  .table-pool {
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
  :deep(.popper-menu-pool) {
    --el-popover-border-radius: 8px;
    --el-popover-padding: 12px 24px;

    z-index: 9999;
  }
</style>
