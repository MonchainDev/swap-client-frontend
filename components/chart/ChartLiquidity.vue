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
    volumeUSD: string
  }

  // Mock data
  const mockData: VolumeData[] = [
    {
      bucket: '2024-03-11T00:00:00.000Z',
      volumeUSD: '2650977219.903787'
    },
    {
      bucket: '2024-03-18T00:00:00.000Z',
      volumeUSD: '2161161525.369488'
    },
    {
      bucket: '2024-03-25T00:00:00.000Z',
      volumeUSD: '2039536286.20008'
    },
    {
      bucket: '2024-04-01T00:00:00.000Z',
      volumeUSD: '1334035691.43142'
    },
    {
      bucket: '2024-04-08T00:00:00.000Z',
      volumeUSD: '1313007798.836468'
    },
    {
      bucket: '2024-04-15T00:00:00.000Z',
      volumeUSD: '943869237.869518'
    },
    {
      bucket: '2024-04-22T00:00:00.000Z',
      volumeUSD: '805565638.608684'
    },
    {
      bucket: '2024-04-29T00:00:00.000Z',
      volumeUSD: '577626780.20935'
    },
    {
      bucket: '2024-05-06T00:00:00.000Z',
      volumeUSD: '537805517.91797'
    },
    {
      bucket: '2024-05-13T00:00:00.000Z',
      volumeUSD: '481497918.70551'
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
    return mockData.map((item) => parseFloat(item.volumeUSD)) // Convert to billions
  })

  const series = ref([
    {
      name: 'Volume (USD)',
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
    colors: ['#049C6B'],
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
        show: false,
        style: {
          colors: '#666',
          fontSize: '12px'
        },
        rotate: 0
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
      custom: function ({ _series, _seriesIndex, _dataPointIndex, _w }) {
        return `<div class="p-[10px] px-[13px] rounded-lg bg-[#49AB8B] flex text-white flex-col">
          <span class="text-white text-sm font-semibold"> Tick stats </span>
          <span class="text-xs">USDT Price: 0.0015 WBNB</span>
          <span class="text-xs">WBNB Price: 675.9196 USDT</span>
          <span class="text-xs">USDT Locked: 2,859.05 USDT</span>
        </div>`
      }

      // y: {
      //   formatter: function (value: number) {
      //     return `$${value.toFixed(2)}B`
      //   }
      // },
      // marker: {
      //   show: true
      // },
      // theme: 'dark',
      // style: {
      //   fontSize: '12px'
      // }
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
  #chart {
    :deep(.apexcharts-tooltip) {
      border: none !important;
      background: none !important;
    }
  }
</style>
