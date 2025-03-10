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
  // Generate sample data from 0 to 100
  const generateData = () => {
    const points = 30
    const result = []

    // Start with a value between 60-80 to allow room for fluctuations
    let value = 20 + Math.random()

    // Generate relatively stable data with small fluctuations
    for (let i = 0; i < points - 5; i++) {
      // Add small random changes, keeping within 0-100 range
      value += Math.random() * 6 - 3
      value = Math.min(Math.max(value, 0), 100) // Clamp between 0 and 100
      result.push(value)
    }

    // Add the drop at the end
    for (let i = 0; i < 5; i++) {
      value -= 5 + Math.random() * 3
      value = Math.max(value, 0) // Ensure it doesn't go below 0
      result.push(value)
    }

    return result
  }

  // Generate data once
  const chartData = generateData()
  const endPointIndex = chartData.length - 1

  // Chart data
  const series = ref([
    {
      name: 'Data',
      data: chartData
    }
  ])

  // Chart options
  const chartOptions = ref<ApexOptions>({
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
          y: 0, // Middle reference line (adjusted for 0-100 scale)
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
  })

  // Custom effect for the end point glow
  onMounted(() => {
    // This part would require custom CSS and possibly DOM manipulation
    // to add the glow effect on the last point
    //   const style = document.createElement('style')
    //   style.innerHTML = `
    //   .apexcharts-marker:last-of-type {
    //     filter: drop-shadow(0 0 8px rgba(74, 222, 128, 0.8));
    //   }
    // `
    //   document.head.appendChild(style)
  })
</script>

<style scoped>
  .chart-container {
  }
</style>
