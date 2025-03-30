<template>
  <div class="h-[250px] w-[400px]">
    <button @click="zoomRef?.zoomIn">Zoom In</button>
    <svg width="100%" height="100%" viewBox="0 0 400 200" style="overflow: visible">
      <defs>
        <linearGradient id="green-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stop-color="#ed4b9e" stop-opacity="1" />
          <stop offset="100%" stop-color="#ed4b9e" stop-opacity="0.2" />
        </linearGradient>
        <linearGradient id="red-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stop-color="#31d0aa" stop-opacity="1" />
          <stop offset="100%" stop-color="#31d0aa" stop-opacity="0.2" />
        </linearGradient>
      </defs>
      <defs>
        <clipPath id="liquidityChartRangeInput-chart-clip">
          <rect x="0" y="0" :width="innerWidth" :height="200" />
        </clipPath>
        <mask v-if="brushDomain" id="liquidityChartRangeInput-chart-area-mask">
          <rect fill="red" :x="xScale(brushDomain[0])" y="0" :width="xScale(brushDomain[1]) - xScale(brushDomain[0])" :height="innerHeight" />
        </mask>
      </defs>

      <g :transform="`translate(${margins.left},${margins.top})`">
        <g :clip-path="`url(#${id}-chart-clip)`">
          <Area
            :series="partitionSeries[0]"
            :x-scale="xScale"
            :y-scale="yScale"
            :x-value="xAccessor"
            :y-value="yAccessor"
            :opacity="0.5"
            fill="url(#red-gradient)"
          />
          <Area
            :series="partitionSeries[1]"
            :x-scale="xScale"
            :y-scale="yScale"
            :x-value="xAccessor"
            :y-value="yAccessor"
            :opacity="0.5"
            fill="url(#green-gradient)"
          />

          <Line :value="current" :x-scale="xScale" :inner-height="innerHeight" />
          <AxisBottom :x-scale="xScale" :inner-height="innerHeight" />
        </g>
      </g>

      <ZoomOverlay ref="zoomRef" :height="200" :width="innerWidth" :zoom-levels="zoomLevels" :on-zoom="onZoom" />
      <Brush
        id="liquidityChartRangeInput"
        :x-scale="xScale"
        :interactive="true"
        :brush-extent="brushDomain ?? (xScale.domain() as [number, number])"
        :inner-width="innerWidth"
        :inner-height="180"
        west-handle-color="#ff6347"
        east-handle-color="#4682b4"
        @update:brush-extent="handleBrushChange"
      />
    </svg>
  </div>
</template>

<script lang="ts" setup>
  import formattedData from '@/constant/mock-chart.json'
  import type { ZoomTransform } from 'd3'
  import { max, scaleLinear } from 'd3'
  import { ZOOM_LEVELS } from '~/constant/zoom-level'
  import Area from './Area.vue'
  import partition from 'lodash/partition'
  import Line from './Line.vue'
  import AxisBottom from './AxisBottom.vue'

  interface ChartEntry {
    activeLiquidity: number
    price0: number
  }

  const series = formattedData

  const zoomRef = useTemplateRef('zoomRef')
  const id = 'liquidityChartRangeInput'

  const yAccessor = (d: ChartEntry) => d.activeLiquidity
  const xAccessor = (d: ChartEntry) => d.price0

  const margins = { top: 10, right: 2, bottom: 20, left: 0 }

  const current = 0.00163505

  const innerWidth = 400 - margins.left - margins.right
  const innerHeight = 200 - margins.top - margins.bottom

  const zoomLevels = ZOOM_LEVELS[2500]

  const currentDomain = ref<[number, number]>([current * zoomLevels.initialMin, current * zoomLevels.initialMax])

  const xScale = computed(() => {
    return scaleLinear().domain(currentDomain.value).range([0, innerWidth])
  })

  const yScale = computed(() => {
    return scaleLinear()
      .domain([0, max(formattedData, yAccessor)] as number[])
      .range([innerHeight, 0])
  })

  const isHighToLow = computed(() => {
    return series[0]?.price0 > series[series.length - 1]?.price0
  })

  const partitionSeries = computed(() => {
    let [left, right] = partition(series, (d) => (isHighToLow.value ? +xAccessor(d) < current : +xAccessor(d) > current))
    if (right.length && right[right.length - 1]) {
      if (right[right.length - 1].price0 !== current) {
        right = [...right, { activeLiquidity: right[right.length - 1].activeLiquidity, price0: current }]
      }
      left = [{ activeLiquidity: right[right.length - 1].activeLiquidity, price0: current }, ...left]
    }
    return [left, right]
  })

  const brushDomain = ref<[number, number] | undefined>([0.0013152, 0.00250792])

  const onZoom = (transform: ZoomTransform) => {
    // Calculate the new domain based on the zoom transform
    const xDomain = transform
      .rescaleX(
        scaleLinear()
          .domain([current * zoomLevels.initialMin, current * zoomLevels.initialMax])
          .range([0, innerWidth])
      )
      .domain()

    // Update the current domain to trigger reactivity
    currentDomain.value = xDomain as [number, number]

    // Optionally update the brush domain if needed
    brushDomain.value = xDomain as [number, number]

    console.log('Zoomed to domain:', xDomain)
  }

  const handleBrushChange = (extent: [number, number]) => {
    console.log('Brush extent:', extent)
  }
</script>

<style lang="scss" scoped></style>
