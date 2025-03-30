<template>
  <path :d="pathData" :opacity="opacity || 1" :stroke="pathFill" :fill="pathFill" />
</template>

<script setup lang="ts">
  import type { ScaleLinear } from 'd3'
  import { area, curveStepAfter } from 'd3'

  interface ChartEntry {
    activeLiquidity: number
    price0: number
  }
  const props = defineProps<{
    series: ChartEntry[]
    xScale: ScaleLinear<number, number>
    yScale: ScaleLinear<number, number>
    xValue: (d: ChartEntry) => number
    yValue: (d: ChartEntry) => number
    fill: string
    opacity: number
  }>()

  const pathFill = computed(() => props.fill)

  const pathData = computed(() => {
    return (
      area()
        .curve(curveStepAfter)
        .x((d: any) => props.xScale(props.xValue(d as ChartEntry)))
        .y1((d: any) => props.yScale(props.yValue(d as ChartEntry)))
        .y0(props.yScale(0))(
        props.series.filter((d) => {
          const value = props.xScale(props.xValue(d))
          return value > 0 && value <= window.innerWidth
        }) as Iterable<[number, number]>
      ) ?? undefined
    )
  })
</script>

<style scoped>
  /* No additional styling needed since we're applying styles directly with attributes */
</style>
