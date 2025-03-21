<template>
  <ClientOnly>
    <div class="chart-container">
      <VueApexCharts type="line" width="248" height="75" :options="chartOptions" :series="series" />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  import type { ApexOptions } from 'apexcharts'
  import VueApexCharts from 'vue3-apexcharts'
  interface IProp {
    data: { periodStartUnix: number; token0Price: string }[]
  }

  const props = withDefaults(defineProps<IProp>(), {
    data: () => []
  })

  const chartData = ref<number[]>([])

  // Chart data
  const series = computed(() => {
    return [
      {
        name: 'Data',
        data: chartData.value
      }
    ]
  })

  const chartOptions = ref<ApexOptions | null>(null)

  onMounted(() => {
    chartData.value = props.data.map((item) => parseFloat(item.token0Price))
    const endPointIndex = chartData.value.length - 1
    chartOptions.value = {
      chart: {
        type: 'line',
        height: 75,
        animations: {
          enabled: true,
          speed: 800
        },
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        },
        background: 'transparent'
      },
      colors: ['#4ade80'], // Green color
      stroke: {
        curve: 'smooth',
        width: 3
      },
      grid: {
        show: false
      },
      markers: {
        size: 0,
        hover: {
          size: 6
        },
        discrete: [
          {
            seriesIndex: 0,
            dataPointIndex: endPointIndex,
            size: 6,
            fillColor: '#4ade80',
            strokeColor: '#fff'
          }
        ]
      },
      annotations: {
        yaxis: [
          {
            y: chartData.value[endPointIndex],
            borderColor: '#4ade80',
            strokeDashArray: 1,
            opacity: 0.5
          }
        ]
      },
      tooltip: {
        enabled: false
      },
      xaxis: {
        labels: {
          show: false
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          show: false
        }
      },
      responsive: [
        {
          breakpoint: 1000,
          options: {
            chart: {
              height: 300
            }
          }
        }
      ]
    }
  })
</script>

<style scoped>
  .chart-container {
  }
</style>
