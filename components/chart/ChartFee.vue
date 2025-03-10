<template>
  <ClientOnly>
    <VueApexCharts id="chart" type="area" width="100%" height="280" style="min-height: 280px" :options="chartOptions" :series="series" />
  </ClientOnly>
</template>

<script lang="ts" setup>
  import type { ApexOptions } from 'apexcharts'
  import VueApexCharts from 'vue3-apexcharts'

  interface VolumeData {
    bucket: string
    feeUSD: string
  }

  // Mock data
  const mockData: VolumeData[] = [
    {
      bucket: '2024-03-10T00:00:00.000Z',
      feeUSD: '27160.3057863269'
    },
    {
      bucket: '2024-03-11T00:00:00.000Z',
      feeUSD: '30057.8315604708'
    },
    {
      bucket: '2024-03-12T00:00:00.000Z',
      feeUSD: '35228.5102597932'
    },
    {
      bucket: '2024-03-13T00:00:00.000Z',
      feeUSD: '40328.759903196'
    },
    {
      bucket: '2024-03-14T00:00:00.000Z',
      feeUSD: '44625.4290152975'
    },
    {
      bucket: '2024-03-15T00:00:00.000Z',
      feeUSD: '47364.5352091075'
    },
    {
      bucket: '2024-03-16T00:00:00.000Z',
      feeUSD: '39000.9363459142'
    },
    {
      bucket: '2024-03-17T00:00:00.000Z',
      feeUSD: '28491.4105226141'
    },
    {
      bucket: '2024-03-18T00:00:00.000Z',
      feeUSD: '29997.5495175697'
    },
    {
      bucket: '2024-03-19T00:00:00.000Z',
      feeUSD: '37214.3339757845'
    }
  ]

  // Format dates for x-axis
  const categories = computed(() => {
    return mockData.map((item) => {
      const date = new Date(item.bucket)
      return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`
    })
  })

  // Format volume data for y-axis
  const volumeData = computed(() => {
    return mockData.map((item) => parseFloat(item.feeUSD)) // Convert to billions
  })

  const series = ref([
    {
      name: 'Fee (USD)',
      data: volumeData.value
    }
  ])

  const chartOptions = ref<ApexOptions>({
    chart: {
      type: 'area',
      height: 400,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 0
    },
    colors: ['#289BF6'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.8,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 90, 100]
      }
    },
    grid: {
      show: true,
      borderColor: '#757575',
      strokeDashArray: 1
    },

    markers: {
      size: 0,
      hover: {
        size: 5
      }
    },
    xaxis: {
      categories: categories.value,
      labels: {
        style: {
          colors: '#000'
        },
        rotate: -45, // Rotate labels for better readability
        hideOverlappingLabels: true, // Prevent overlapping
        formatter: function (value) {
          // Find the index of the current value in the categories array
          const index = categories.value.indexOf(value)
          // Show every 4th label to reduce clutter
          return index % 2 === 0 ? value : ''
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      min: 0,
      max: Math.ceil(Math.max(...volumeData.value)),
      tickAmount: 5,
      labels: {
        style: {
          colors: '#666',
          fontSize: '12px'
        },
        formatter: function (val: number) {
          return formatNumberAbbreviation(val).toString()
        }
      }
    },
    tooltip: {
      // custom: function ({ series, seriesIndex, dataPointIndex, _w }) {
      //   return `<div class="p-[10px] px-[13px] rounded-lg bg-[#49AB8B] flex text-white flex-col">
      //     <span class="text-white text-sm font-semibold"> Tick stats </span>
      //     <span class="text-xs">USDT Price: 0.0015 WBNB</span>
      //     <span class="text-xs">WBNB Price: 675.9196 USDT</span>
      //     <span class="text-xs">USDT Locked: 2,859.05 USDT</span>
      //   </div>`
      // }
      y: {
        formatter: function (value: number) {
          return formatNumberAbbreviation(value).toString()
        }
      },
      marker: {
        show: true
      },
      theme: 'dark',
      style: {
        fontSize: '12px'
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 300
          },
          xaxis: {
            labels: {
              rotate: -45,
              offsetY: 0
            }
          }
        }
      }
    ]
  })
</script>

<style lang="scss" scoped>
  // #chart {
  //   :deep(.apexcharts-tooltip) {
  //     border: none !important;
  //     background: none !important;
  //   }
  // }
</style>
