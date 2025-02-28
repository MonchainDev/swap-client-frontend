<template>
  <div class="grid grid-cols-4 gap-3" :class="{ 'pointer-events-none opacity-50': isDisabledPriceRange, '!grid-cols-1': !feeAmount }">
    <div
      v-for="key in sortListRange"
      :key="key"
      :class="{ 'bg-hyperlink text-white': buttonRangePercent === +key }"
      class="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-solid border-hyperlink text-sm font-semibold text-hyperlink"
      @click="emit('select', +key, listSelectRange[+key])"
    >
      {{ key }}%
    </div>
    <div
      class="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-solid border-hyperlink text-sm font-semibold text-hyperlink"
      @click="emit('select', 100)"
    >
      Full range
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { FeeAmount } from 'monswap-client/packages/v3-sdk/src'
  import { QUICK_ACTION_CONFIGS } from '~/constant'
  import type { ZoomLevels } from '~/types'

  const { feeAmount, buttonRangePercent, startPriceTypedValue } = storeToRefs(useLiquidityStore())

  const emit = defineEmits<{
    select: [key: number, item?: ZoomLevels]
  }>()

  const listSelectRange = computed(() => {
    return QUICK_ACTION_CONFIGS[feeAmount.value ?? FeeAmount.MEDIUM]
  })

  const sortListRange = computed(() => Object.keys(listSelectRange.value || []).sort((a, b) => Number(a) - Number(b)))

  const isDisabledPriceRange = computed(() => {
    return !startPriceTypedValue.value
  })
</script>

<style lang="scss"></style>
