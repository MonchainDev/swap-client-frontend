<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center justify-between">
      <div class="flex gap-4">
        <NuxtLink to="/liquidity/pool" class="flex size-10 items-center justify-center rounded-lg border border-solid border-gray-3 bg-white">
          <BaseIcon name="arrow-down" size="24" class="rotate-90" />
        </NuxtLink>
        <div class="flex items-center gap-[9px] text-xl font-semibold">
          <div class="flex">
            <img src="/token-default.png" alt="token " class="size-[25px] rounded-full border border-solid border-white" />
            <img src="/token-default.png" alt="token " class="-ml-4 size-[25px] rounded-full border border-solid border-white" />
          </div>
          <span>{{ pool.baseSymbol }} + {{ pool.quoteSymbol }}</span>
        </div>
      </div>
    </div>
    <div class="flex gap-10">
      <div class="flex flex-col gap-[6px]">
        <span class="text-sm">Fee tier</span>
        <span class="text-xl font-semibold">{{ pool.fee / 10000 }}%</span>
      </div>
      <div class="flex flex-col gap-[6px]">
        <span class="text-sm">Network</span>
        <div class="flex items-center gap-[10px] text-xl font-semibold">
          <img src="/logo-mon-chain.png" alt="logo" class="size-5" />
          <span>Mon chain</span>
        </div>
      </div>
      <div class="flex flex-col gap-[6px]">
        <div class="flex items-center space-x-1 text-sm">
          <BaseIcon name="calculator" size="18" />
          <span>APR</span>
        </div>
        <span class="text-xl">
          <span class="font-semibold text-[#049C6B]">{{ formatNumber((pool.feeApr || 0).toFixed(2)) }}% </span
          >{{ formatNumber((pool.rewardApr || 0).toFixed(2)) }}%</span
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { IPool } from '~/types/pool.type'

  interface IProps {
    pool: IPool
  }

  const _props = withDefaults(defineProps<IProps>(), {
    pool: () => ({}) as IPool
  })
</script>

<style lang="scss" scoped></style>
