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
    tvlUSD: string
  }

  // Mock data
  const mockData: VolumeData[] = [
    {
      bucket: '2024-03-04T00:00:00.000Z',
      tvlUSD: '2365129.4098708467'
    },
    {
      bucket: '2024-03-11T00:00:00.000Z',
      tvlUSD: '3536566.2097366'
    },
    {
      bucket: '2024-03-18T00:00:00.000Z',
      tvlUSD: '4290591.676426181'
    },
    {
      bucket: '2024-03-25T00:00:00.000Z',
      tvlUSD: '5534852.786122969'
    },
    {
      bucket: '2024-04-01T00:00:00.000Z',
      tvlUSD: '5798999.817397087'
    },
    {
      bucket: '2024-04-08T00:00:00.000Z',
      tvlUSD: '4251665.220798277'
    },
    {
      bucket: '2024-04-15T00:00:00.000Z',
      tvlUSD: '4367884.155861819'
    },
    {
      bucket: '2024-04-22T00:00:00.000Z',
      tvlUSD: '4927972.373340883'
    },
    {
      bucket: '2024-04-29T00:00:00.000Z',
      tvlUSD: '5251697.841050788'
    },
    {
      bucket: '2024-05-06T00:00:00.000Z',
      tvlUSD: '5513975.049802122'
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
    return mockData.map((item) => parseFloat(item.tvlUSD)) // Convert to billions
  })

  const series = ref([
    {
      name: 'TVL (USD)',
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
    colors: ['#9600B0'],
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
