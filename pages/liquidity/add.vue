<template>
  <div class="mx-auto mb-[74px] mt-[38px] max-w-[1024px]">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/liquidity" class="flex size-10 items-center justify-center rounded-lg border border-solid border-gray-3 bg-white">
          <BaseIcon name="arrow-down" size="24" class="rotate-90" />
        </NuxtLink>
        <h4 class="text-xl font-semibold">Liquidity Pools & Farms / Add Liquidity</h4>
      </div>
    </div>
    <div class="mt-7 grid grid-cols-[513px_1fr] gap-1">
      <BlockAddLiquidityLeft :is-token0-selected :is-token1-selected />
      <BlockAddLiquidityRight :is-token0-selected :is-token1-selected />
    </div>
  </div>
</template>

<script lang="ts" setup>
  definePageMeta({
    middleware: ['reset-form-liquidity-middleware']
  })

  const { form } = storeToRefs(useLiquidityStore())

  const isToken0Selected = computed(() => form.value.token0.symbol !== '')
  const isToken1Selected = computed(() => form.value.token1.symbol !== '')
</script>

<style lang="scss"></style>
