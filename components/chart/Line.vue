<template>
  <line :x1="xScale(value)" y1="0" :x2="xScale(value)" :y2="innerHeight" class="styled-line" />
</template>

<script setup lang="ts">
  import type { ScaleLinear } from 'd3'

  const _props = defineProps<{
    value: number
    xScale: ScaleLinear<number, number>
    innerHeight: number
  }>()
</script>

<style scoped>
  .styled-line {
    opacity: 0.5;
    stroke-width: 1;
    stroke: #31d0aa;
    fill: none;
    stroke-dasharray: 3;
  }
</style>
