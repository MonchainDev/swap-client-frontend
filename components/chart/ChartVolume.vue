<template>
  <ClientOnly>
    <div id="hover-info" class="hover-info">
      <div class="flex items-end gap-1">
        <span class="text-[32px] font-semibold leading-none text-gray-8">${{ hoveredData.volume }}</span>
        <span class="text-xs text-hyperlink">{{ hoveredData.date }}</span>
      </div>
    </div>
    <VueApexCharts width="100%" height="280" style="min-height: 280px" type="bar" :options="chartOptions" :series="series" />
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

  const maxIndex = computed(() => {
    return props.chartData.reduce((maxIndex, item, index) => (parseFloat(item.value) > parseFloat(props.chartData[maxIndex].value) ? index : maxIndex), 0)
  })

  const maxDate = computed(() => {
    return formatDate(props.chartData[maxIndex.value].date)
  })
  const maxValue = computed(() => {
    return formatNumberAbbreviation(parseFloat(Number(data.value[maxIndex.value] ?? 0).toFixed(2)))
  })

  // Find the index of the maximum value for annotation
  // const maxDate = formatDate(MockData[maxIndex].bucket)
  // const maxValue = formatNumberAbbreviation(data[maxIndex])

  const series = computed(() => {
    return [
      {
        name: 'Volume',
        data: data.value
      }
    ]
  })

  const hoveredData = ref({
    date: maxDate.value,
    volume: maxValue.value
  })

  const chartOptions = computed((): ApexOptions => {
    return {
      chart: {
        type: 'bar',
        background: '#fff', // Dark background
        foreColor: '#000', // White text color
        toolbar: {
          show: false
        },
        events: {
          mouseMove: (event, chartContext, config) => {
            const { dataPointIndex } = config
            if (dataPointIndex >= 0) {
              hoveredData.value.date = formatDate(props.chartData[dataPointIndex].date)
              hoveredData.value.volume = formatNumberAbbreviation(parseFloat(Number(data.value[dataPointIndex] ?? 0).toFixed(2)))
            }
          },
          mouseLeave: () => {
            hoveredData.value.date = maxDate.value
            hoveredData.value.volume = maxValue.value
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%'
          // endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: false
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
            // const index = categories.value.indexOf(value)
            // Show every 4th label to reduce clutter
            // return index % 2 === 0 ? value : ''
            return value
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#000'
          },
          formatter: function (value) {
            return formatNumberAbbreviation(value).toString()
          }
        },
        min: 0,
        max: Math.max(...data.value) * 1.01, // Add some padding
        tickAmount: 6
      },
      colors: ['#00b0ff'], // Bar color
      grid: {
        show: true,
        borderColor: '#757575',
        strokeDashArray: 1
      },

      tooltip: {
        theme: 'dark',
        x: {
          formatter: function (value, { dataPointIndex }) {
            // Use the dataPointIndex to get the corresponding category (date)
            return categories.value[dataPointIndex]
          }
        },
        y: {
          formatter: function (value) {
            return formatNumberAbbreviation(value).toString()
          }
        }
      }
    }
  })

  function formatDate(isoString: string) {
    const date = new Date(isoString)
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    return `${date.toLocaleDateString('en-US', options)} (UTC)`
  }
</script>

<style lang="scss" scoped></style>
