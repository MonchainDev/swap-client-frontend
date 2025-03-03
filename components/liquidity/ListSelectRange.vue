<template>
  <div class="grid grid-cols-4 gap-3" :class="{ '!grid-cols-1': !feeAmount }">
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
      :class="{ 'bg-hyperlink text-white': buttonRangePercent === 100 }"
      @click="emit('select', 100)"
    >
      Full range
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { QUICK_ACTION_CONFIGS } from '~/constant'
  import { FeeAmount } from '~/constant/fee'
  import type { ZoomLevels } from '~/types'

  const { feeAmount, buttonRangePercent } = storeToRefs(useLiquidityStore())

  const emit = defineEmits<{
    select: [key: number, item?: ZoomLevels]
  }>()

  const listSelectRange = computed(() => {
    return QUICK_ACTION_CONFIGS[feeAmount.value ?? FeeAmount.MEDIUM]
  })

  const sortListRange = computed(() => Object.keys(listSelectRange.value || []).sort((a, b) => Number(a) - Number(b)))
</script>

<style lang="scss"></style>
