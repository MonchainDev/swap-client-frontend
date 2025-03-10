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
  import VueApexCharts from 'vue3-apexcharts'
  import MockData from '@/constant/mock-volume.json'
  import type { ApexOptions } from 'apexcharts'

  // Process data for chart
  const categories = MockData.filter((item) => +item.volumeUSD > 0).map((item) => {
    const date = new Date(item.bucket)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
  const data = MockData.filter((item) => +item.volumeUSD > 0).map((item) => parseFloat(item.volumeUSD))

  // Find the index of the maximum value for annotation
  const maxIndex = MockData.reduce((maxIndex, item, index) => (parseFloat(item.volumeUSD) > parseFloat(MockData[maxIndex].volumeUSD) ? index : maxIndex), 0)
  const maxDate = formatDate(MockData[maxIndex].bucket)
  const maxValue = formatNumberAbbreviation(data[maxIndex])

  const series = [
    {
      name: 'Volume USD',
      data: data
    }
  ]

  const hoveredData = ref({
    date: maxDate,
    volume: maxValue
  })

  const chartOptions: ApexOptions = {
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
            hoveredData.value.date = formatDate(MockData[dataPointIndex].bucket)
            hoveredData.value.volume = formatNumberAbbreviation(data[dataPointIndex])
          }
        },
        mouseLeave: () => {
          hoveredData.value.date = maxDate
          hoveredData.value.volume = maxValue
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
      categories: categories,
      labels: {
        style: {
          colors: '#000'
        },
        rotate: -45, // Rotate labels for better readability
        hideOverlappingLabels: true, // Prevent overlapping
        formatter: function (value) {
          // Find the index of the current value in the categories array
          const index = categories.indexOf(value)
          // Show every 4th label to reduce clutter
          return index % 2 === 0 ? value : ''
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
      max: Math.max(...data) * 1.01, // Add some padding
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
          return categories[dataPointIndex]
        }
      },
      y: {
        formatter: function (value) {
          return formatNumberAbbreviation(value).toString()
        }
      }
    }
  }

  function formatDate(isoString: string) {
    const date = new Date(isoString)
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    return `${date.toLocaleDateString('en-US', options)} (UTC)`
  }
</script>

<style lang="scss" scoped></style>
