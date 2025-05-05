<template>
  <g class="styled-group" :transform="`translate(0, ${innerHeight + offset})`">
    <g ref="axisRef" />
  </g>
</template>

<script setup lang="ts">
  import type { ScaleLinear } from 'd3'
  import { axisBottom, select } from 'd3'

  const props = defineProps<{
    xScale: ScaleLinear<number, number>
    innerHeight: number
    offset?: number
  }>()

  // Set default value for offset
  const offset = props.offset ?? 0

  // Reference to the axis element
  const axisRef = ref<SVGGElement | null>(null)

  // Function to render the axis
  const renderAxis = () => {
    if (!axisRef.value) return

    const axisGenerator = axisBottom(props.xScale).ticks(6)

    select(axisRef.value)
      .call(axisGenerator)
      .call((g) => g.select('.domain').remove())
  }

  // Initial render
  onMounted(() => {
    renderAxis()
  })

  // Watch for changes in props that would require re-rendering the axis
  watch([() => props.xScale, () => props.innerHeight, () => props.offset], () => {
    renderAxis()
  })
</script>

<style scoped>
  .styled-group :deep(line) {
    display: none;
  }

  .styled-group :deep(text) {
    color: #0a0b0d;
    transform: translateY(5px);
  }
</style>
