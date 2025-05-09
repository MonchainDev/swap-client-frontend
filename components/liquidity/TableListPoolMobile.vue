<template>
  <div class="mx-4 mb-[80px] mt-6">
    <div v-for="(item, index) in props.data" :key="index" class="mb-2 rounded-lg bg-white px-4 py-2">
      <div class="wrap-table flex items-center justify-between">
        <NuxtLink :to="{ name: 'liquidity-pool-network-address', params: { network: item.network, address: item.poolAddress } }" class="flex gap-[10px]">
          <div class="flex">
            <img :src="tokenLogoBySymbol(item.baseSymbol)" alt="logo" class="size-9" />
            <img :src="tokenLogoBySymbol(item.quoteSymbol)" alt="logo" class="-ml-[18px] size-9" />
          </div>
          <div class="flex flex-1 flex-col">
            <span class="text-base font-semibold">{{ item.baseSymbol }} / {{ item.quoteSymbol }}</span>
            <div class="flex items-center gap-1">
              <img :src="getNetwork(item.network)?.logo" alt="logo" class="h-[14px] w-[14px]" />
              <span class="text-xs text-gray-8">{{ getNetwork(item.network)?.name }}</span>
            </div>
          </div>
        </NuxtLink>
        <BaseIcon name="three-dot" size="24" class="cursor-pointer" @click="emit('view', item)" />
      </div>
      <div class="mt-2 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="border-b border-dashed border-[#D9D9D9] text-sm font-bold text-[#049C6B]">
            Up to {{ (Number(item.feeApr ?? 0) + Number(item.rewardApr ?? 0)).toFixed(2) }}%
          </div>
          <!-- <div class="font-semibold text-gray-6">{{ item.rewardApr }}%</div> -->
        </div>
        <div class="flex h-5 w-[55px] items-center justify-center rounded-sm bg-[#F5F5F5] text-xs font-semibold">{{ item.fee / 10000 }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

  const emit = defineEmits<{
    view: [item: IPool]
  }>()

  const getNetwork = (networkName: string) => {
    return LIST_NETWORK.find((item) => item.network === networkName)
  }
</script>

<style lang="scss" scoped>
  :deep(.wrap-table) {
    .el-overlay {
      background-color: rgba(0, 0, 0, 0.01);
      .el-drawer {
        box-shadow: none;
      }
    }
  }
  :deep(.drawer-liquid) {
    .el-drawer__header {
      @apply mb-0 px-4 pt-4;
    }
    .el-drawer__body {
      @apply p-0;
    }
  }
</style>
