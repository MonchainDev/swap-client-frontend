<template>
  <ClientOnly>
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
        name: 'Volume (USD)',
        data: data.value
      }
    ]
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
        custom: function ({ _series, _seriesIndex, dataPointIndex, _w }) {
          // console.log('🚀 ~ chartOptions ~ dataPointIndex:', dataPointIndex)
          const { token0Price, token1Price, token0Symbol, token1Symbol, totalValueLockedToken0 } = props.chartData[dataPointIndex]
          // console.log('🚀 ~ chartOptions ~ token1Price:', token1Price)
          // console.log('🚀 ~ chartOptions ~ token0Price:', token0Price)
          return `<div class="p-[10px] px-[13px] rounded-lg bg-[#49AB8B] flex text-white flex-col">
          <span class="text-white text-sm font-semibold"> Tick stats </span>
          <span class="text-xs">${token0Symbol} Price: ${formatNumber(parseFloat(token0Price).toFixed(2))} ${token0Symbol}</span>
          <span class="text-xs">${token1Symbol} Price: ${formatNumber(parseFloat(token1Price).toFixed(2))} ${token1Symbol}</span>
          <span class="text-xs">${token0Symbol} Locked: ${formatNumber(parseFloat(totalValueLockedToken0).toFixed(2))} ${token0Symbol}</span>
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
      }
    }
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
