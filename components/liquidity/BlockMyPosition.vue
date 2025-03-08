<template>
  <div class="flex flex-col gap-[22px]">
    <span class="text-2xl font-semibold leading-7">My Positions</span>
    <div class="grid grid-cols-[374px_1fr] gap-6">
      <div class="rounded-lg bg-white px-6 pb-6 pt-4 shadow-sm">
        <div class="flex flex-col gap-5 border-b border-dashed border-gray-4 pb-5">
          <span class="font-semibold">Overview</span>
          <div class="flex flex-col gap-3 text-sm">
            <div class="flex items-center justify-between">
              <span>My Liquidity Value</span>
              <span class="font-medium">$0.00</span>
            </div>
            <div class="flex items-center justify-between">
              <span>My Total APR</span>
              <span class="font-medium">0.00%</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Earning</span>
              <div class="flex items-center gap-1 font-medium">
                <span>LP Fee</span>
                <div class="flex">
                  <img src="/token-default.png" alt="logo" class="size-6" />
                  <img src="/token-default.png" alt="logo" class="-ml-3 size-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 flex flex-col gap-1">
          <span class="font-semibold">Total farming earning</span>
          <div class="flex items-end gap-1">
            <span class="text-linear text-[32px] font-semibold leading-none">$0</span>
            <span class="text-xs text-gray-7">0</span>
          </div>
        </div>
        <BaseButton class="mt-6 flex w-full items-center" size="sm">
          <BaseIcon name="plus" size="18" />
          <span>Add Liquidity</span>
        </BaseButton>
      </div>
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <div class="flex justify-between">
          <span class="font-semibold">0 positions</span>
          <BaseTab v-model:model="tabActive" :list="listTab" />
        </div>
        <div class="mt-6 flex h-[235px] items-center justify-center rounded-lg bg-gray-1">
          <BaseIcon name="trash" size="80" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { ITab } from '~/types/component.type'

  const enum TabValue {
    ALL = 'ALL',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    CLOSE = 'CLOSE'
  }

  const listTab: ITab[] = [
    { title: 'All', value: TabValue.ALL },
    { title: 'Active', value: TabValue.ACTIVE },
    { title: 'Inactive', value: TabValue.INACTIVE },
    { title: 'Closed', value: TabValue.CLOSE }
  ]

  const tabActive = ref<TabValue>(TabValue.ALL)
</script>

<style lang="scss" scoped></style>
