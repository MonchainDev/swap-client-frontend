<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="mx-auto mt-10 h-[300px] w-[500px]">
    <svg id="chart" width="100%" height="100%" style="overflow: visible">
      <defs>
        <linearGradient id="green-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stop-color="#ed4b9e" stop-opacity="1" />
          <stop offset="100%" stop-color="#ed4b9e" stop-opacity="0.2" />
        </linearGradient>
        <linearGradient id="red-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#31d0aa" stopOpacity="1" />
          <stop offset="100%" stopColor="#31d0aa" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g>
        <path
          opacity="0.5"
          fill="url(#green-gradient)"
          d="M7.071,110.891L16.985,110.891L16.985,109.853L27.56,109.853L27.56,109.909L37.474,109.909L37.474,109.704L47.388,109.704L47.388,109.562L57.302,109.562L57.302,109.562L67.215,109.562L67.215,109.562L77.129,109.562L77.129,109.606L87.043,109.606L87.043,109.703L96.957,109.703L96.957,110.245L106.871,110.245L106.871,110.147L116.785,110.147L116.785,110.316L126.699,110.316L126.699,110.328L136.613,110.328L136.613,110.328L146.527,110.328L146.527,110.328L156.441,110.328L156.441,110.008L166.355,110.008L166.355,110.008L176.268,110.008L176.268,110.005L186.182,110.005L186.182,110.005L196.096,110.005L196.096,109.983L206.01,109.983L206.01,109.985L208.046,109.985L208.046,109.985L208.046,170L208.046,170L206.01,170L206.01,170L196.096,170L196.096,170L186.182,170L186.182,170L176.268,170L176.268,170L166.355,170L166.355,170L156.441,170L156.441,170L146.527,170L146.527,170L136.613,170L136.613,170L126.699,170L126.699,170L116.785,170L116.785,170L106.871,170L106.871,170L96.957,170L96.957,170L87.043,170L87.043,170L77.129,170L77.129,170L67.215,170L67.215,170L57.302,170L57.302,170L47.388,170L47.388,170L37.474,170L37.474,170L27.56,170L27.56,170L16.985,170L16.985,170L7.071,170Z"
          class="sc-81b3b8bd-0 ewMsml"
        ></path>
      </g>
    </svg>
  </div>
</template>

<script lang="ts" setup>
  // import MOCK_DATA from '@/constant/mock.json'

  import * as d3 from 'd3'

  const svg = ref<d3.Selection<SVGGElement, unknown, HTMLElement, unknown> | null>()

  const width = 500
  const height = 300
  const margin = { top: 10, right: 10, bottom: 10, left: 10 }

  onMounted(() => {
    svg.value = d3
      .select('#chart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
  })
</script>

<style lang="scss"></style>
