<template>
  <div class="mx-auto mt-[38px] max-w-[1024px]">
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <h4 class="text-xl font-semibold">Liquidity Pools & Farms</h4>
        <p class="text-sm text-gray-8">
          Maximize earnings with secure and smart farming <span class="text-gray-4"> | </span>
          <span class="text-hyperlink">Learn how</span>
          <span class="text-gray-4"> | </span>
          <span class="text-hyperlink">FAQ</span>
        </p>
      </div>
      <div class="flex items-center gap-[50px]">
        <div class="flex gap-6 text-sm font-semibold text-gray-7">
          <span class="cursor-pointer pb-[10px] hover:text-hyperlink" :class="{ 'tab-active': tabActive === 'ALL' }" @click="tabActive = 'ALL'">All Pools</span>
          <span class="cursor-pointer pb-[10px] hover:text-hyperlink" :class="{ 'tab-active': tabActive === 'POSITION' }" @click="tabActive = 'POSITION'"
            >My Positions</span
          >
        </div>
        <BaseButton size="sm" class="flex w-[149px] items-center gap-1 !text-white">
          <BaseIcon name="plus" size="24" />
          <span>Add Liquidity</span>
        </BaseButton>
      </div>
    </div>
    <TableListPool />
  </div>
</template>

<script lang="ts" setup>
  const tabActive = ref<'ALL' | 'POSITION'>('ALL')
</script>

<style lang="scss" scoped>
  .tab-active {
    position: relative;
    color: var(--color-hyperlink);
    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 4px;
      border-radius: 2px;
      background-color: #1573fe;
    }
  }
</style>
