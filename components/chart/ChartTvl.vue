<template>
  <ClientOnly>
    <div id="hover-info" class="hover-info">
      <div class="flex items-end gap-1">
        <span class="text-[32px] font-semibold leading-none text-gray-8">${{ hoveredData.volume }}</span>
        <span class="text-xs text-hyperlink">{{ hoveredData.date }}</span>
      </div>
    </div>
    <VueApexCharts id="chart" type="area" width="100%" height="280" style="min-height: 280px" :options="chartOptions" :series="series" />
  </ClientOnly>
</template>

<script lang="ts" setup>
  import type { ApexOptions } from 'apexcharts'
  import VueApexCharts from 'vue3-apexcharts'
  import type { IDataChart } from '../liquidity/BlockPairInfo.vue'

  interface IProps {
    chartData: IDataChart[]
  }

  const props = withDefaults(defineProps<IProps>(), {
    chartData: () => []
  })

  // Process data for chart
  const categories = computed(() => {
    return props.chartData.map((item) => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })
  })
  const data = computed(() => {
    return props.chartData.map((item) => +item.value)
  })

  const series = computed(() => {
    return [
      {
        name: 'TVL (USD)',
        data: data.value
      }
    ]
  })

  const maxIndex = computed(() => {
    return props.chartData.reduce((maxIndex, item, index) => (parseFloat(item.value) > parseFloat(props.chartData[maxIndex].value) ? index : maxIndex), 0)
  })

  const maxDate = computed(() => {
    return formatDate(props.chartData[maxIndex.value].date)
  })
  const maxValue = computed(() => {
    return formatNumberAbbreviation(data.value[maxIndex.value])
  })

  const hoveredData = ref({
    date: maxDate,
    volume: maxValue
  })
  const chartOptions = computed((): ApexOptions => {
    return {
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
        max: Math.ceil(Math.max(...data.value)),
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
    }
  })

  function formatDate(isoString: string) {
    const date = new Date(isoString)
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    return `${date.toLocaleDateString('en-US', options)} (UTC)`
  }
</script>

<style lang="scss" scoped>
  // #chart {
  //   :deep(.apexcharts-tooltip) {
  //     border: none !important;
  //     background: none !important;
  //   }
  // }
</style>
