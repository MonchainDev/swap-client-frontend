<template>
  <div class="flex items-center justify-between sm:relative sm:z-10 sm:flex-col sm:items-start sm:gap-4 sm:rounded-lg sm:bg-white sm:px-4 sm:pb-7 sm:pt-[10px]">
    <div class="flex items-center justify-between">
      <div class="flex gap-4 sm:gap-3">
        <NuxtLink to="/liquidity/pool" class="flex size-10 items-center justify-center rounded-lg border border-solid border-gray-3 bg-white sm:border-none">
          <BaseIcon name="arrow-down" size="24" class="rotate-90" />
        </NuxtLink>
        <div class="flex items-center gap-[9px] text-xl font-semibold sm:text-sm">
          <div class="flex">
            <img
              :src="props.pool.baseLogo || ''"
              alt="token "
              class="size-[25px] rounded-full border border-solid border-white sm:size-8"
              @error="handleImageError"
            />
            <img
              :src="props.pool.quoteLogo || ''"
              alt="token "
              class="-ml-4 size-[25px] rounded-full border border-solid border-white sm:size-8"
              @error="handleImageError"
            />
          </div>
          <div class="sm:flex sm:flex-col">
            <span>{{ pool.baseSymbol }} + {{ pool.quoteSymbol }}</span>
            <div class="hidden items-center gap-[10px] text-xs font-semibold sm:flex">
              <img :src="networkOfPool?.logo" alt="logo" class="size-3" />
              <span>{{ networkOfPool?.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-10">
      <div class="flex flex-col gap-[6px]">
        <span class="text-sm">Fee tier</span>
        <span class="text-xl font-semibold">{{ pool.fee / 10000 }}%</span>
      </div>
      <div class="flex flex-col gap-[6px] sm:hidden">
        <span class="text-sm">Network</span>
        <div class="flex items-center gap-[10px] text-xl font-semibold">
          <img :src="networkOfPool?.logo" alt="logo" class="size-5" />
          <span>{{ networkOfPool?.name }}</span>
        </div>
      </div>
      <div class="flex flex-col gap-[6px]">
        <div class="flex items-center space-x-1 text-sm">
          <BaseIcon name="calculator" size="18" />
          <span>APR</span>
        </div>
        <AprView :farm-apr="pool.rewardApr" :lp-fee-apr="pool.feeApr" :old-farm-apr="pool.lastApr">
          <span class="text-xl">
            <span class="font-semibold text-[#049C6B]">{{ formatNumber((Number(pool.feeApr || 0) + Number(pool.rewardApr || 0)).toFixed(2)) }}% </span>
            {{ formatNumber((pool.lastApr || 0).toFixed(2)) }}%
          </span>
        </AprView>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { LIST_NETWORK } from '~/config/networks'
  import type { IPool } from '~/types/pool.type'

  interface IProps {
    pool: IPool
  }

  const props = withDefaults(defineProps<IProps>(), {
    pool: () => ({}) as IPool
  })
  const { network: networkPoolInfo } = useRoute('info-network-address').params

  const { network: networkPoolDetail } = useRoute('liquidity-pool-network-address').params

  const networkOfPool = computed(() => {
    const networkUrl = networkPoolInfo || networkPoolDetail
    return LIST_NETWORK.find((item) => item.network.toUpperCase() === networkUrl.toUpperCase())
  })

  const { handleImageError } = useErrorImage()
</script>

<style lang="scss" scoped></style>
