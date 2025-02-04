<template>
  <div class="sticky bottom-0 hidden h-[76px] items-center justify-around bg-white sm:flex">
    <NuxtLink to="/" active-class="active-menu" class="flex flex-col items-center justify-center">
      <BaseIcon name="menu-home" class="text-gray-8" size="22" />
      <span class="text-xs text-gray-8">Home</span>
    </NuxtLink>
    <NuxtLink to="/swap" active-class="active-menu" class="flex flex-col items-center justify-center">
      <BaseIcon name="menu-swap" class="text-gray-8" size="22" />
      <span class="text-xs text-gray-8">Swap</span>
    </NuxtLink>

    <div to="/swap" active-class="active-menu" class="flex flex-col items-center justify-center">
      <BaseIcon name="menu-cross-chain" class="text-gray-8" size="22" />
      <span class="text-nowrap text-xs text-gray-8">Cross chain</span>
    </div>
    <div to="/swap" active-class="active-menu" class="flex flex-col items-center justify-center">
      <BaseIcon name="menu-liquidity" class="text-gray-8" size="22" />
      <span class="text-nowrap text-xs text-gray-8">Add Liquidity</span>
    </div>
    <div to="/swap" active-class="active-menu" class="flex flex-col items-center justify-center">
      <BaseIcon name="menu-farm" class="text-gray-8" size="22" />
      <span class="text-xs text-gray-8">Farm</span>
    </div>
    <div to="/swap" active-class="active-menu" class="flex flex-col items-center justify-center">
      <BaseIcon name="menu-bridge" class="text-gray-8" size="22" />
      <span class="text-xs text-gray-8">Bridge</span>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
  .active-menu {
    * {
      color: var(--color-hyperlink);
    }
  }
</style>
