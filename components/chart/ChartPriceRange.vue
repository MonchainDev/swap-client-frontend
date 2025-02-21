<!-- eslint-disable vue/html-self-closing -->
<template>
  <div>
    <svg id="chart" width="453" height="235"></svg>
  </div>
</template>

<script lang="ts" setup>
  import * as d3 from 'd3'

  const widthRoot = 453
  const margin = { top: 20, right: 20, bottom: 20, left: 20 }
  const width = widthRoot - margin.left - margin.right
  const height = 235

  const svg = ref<d3.Selection<SVGGElement, unknown, HTMLElement, unknown> | null>(null)

  onMounted(async () => {
    await nextTick()
    console.log(d3.select('svg'))

    svg.value! = d3
      .select('#chart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    drawChart()
  })

  function drawChart() {
    const data = d3.range(1000).map(d3.randomInt(0, 1000))

    const x = d3
      .scaleLinear()
      .domain([d3.min(data)!, d3.max(data)!])
      .range([0, width])

    const histogram = d3
      .bin()
      .domain(() => x.domain() as [number, number])
      .thresholds(x.ticks(50))

    const bins = histogram(data)

    const areaData = bins.map((d) => ({
      x: (d.x0! + d.x1!) / 2,
      y: d.length
    }))

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(areaData, (d) => d.y)!])
      .range([height, 0])

    // Vẽ đường current price
    const randomValue = 550
    const fixedCurrentPrice = x(randomValue)

    // Tạo hai area riêng biệt
    const areaLeft = d3
      .area<{ x: number; y: number }>()
      .x((d) => x(d.x))
      .y0(height)
      .y1((d) => y(d.y))

    const areaRight = d3
      .area<{ x: number; y: number }>()
      .x((d) => x(d.x))
      .y0(height)
      .y1((d) => y(d.y))

    // Vẽ area chart bên trái
    svg
      .value!.append('path')
      .datum(areaData.filter((d) => d.x <= randomValue)) // Lọc dữ liệu bên trái
      .attr('fill', 'url(#gradient)')
      .attr('d', areaLeft)

    // Thêm gradient trái
    const gradient = svg.value!.append('defs').append('linearGradient').attr('id', 'gradient').attr('x1', '1').attr('y1', '0').attr('x2', '0').attr('y2', '0')

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#ed4b9e').attr('stop-opacity', 1)

    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#ed4b9e').attr('stop-opacity', 0.2)

    // Vẽ area chart bên phải
    svg
      .value!.append('path')
      .datum(areaData.filter((d) => d.x >= randomValue)) // Lọc dữ liệu bên phải
      .attr('fill', 'url(#gradientRight)')
      .attr('d', areaRight)

    // Gradient mới từ bên phải fixedCurrentPrice
    const gradientRight = svg
      .value!.append('defs')
      .append('linearGradient')
      .attr('id', 'gradientRight')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1')

    gradientRight.append('stop').attr('offset', '0%').attr('stop-color', '#31d0aa').attr('stop-opacity', 1)

    gradientRight.append('stop').attr('offset', '100%').attr('stop-color', '#31d0aa').attr('stop-opacity', 0.2)

    // Vẽ trục X
    svg.value!.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(5)).selectAll('text').style('fill', 'purple')

    svg
      .value!.append('line')
      .attr('class', 'current-price-line')
      .attr('x1', fixedCurrentPrice)
      .attr('x2', fixedCurrentPrice)
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#31d0aa')
      .style('stroke-width', '1')
      .style('stroke-dasharray', '3,3')

    // Thêm brush
    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [width, height]
      ])
      .on('brush', (value) => brushed(value, x))
      .on('end', (value) => endBrushed(value, brush, brushGroup as unknown as d3.Selection<SVGGElement, unknown, null, undefined>, defaultSelection))

    const brushGroup = svg.value!.append('g').attr('class', 'brush').call(brush)
    const defaultSelection: d3.BrushSelection = [x(300), x(700)]

    brushGroup.call(brush.move, defaultSelection)

    updateHandles(defaultSelection)
  }

  function brushed(event: d3.D3BrushEvent<unknown>, x: d3.ScaleLinear<number, number>) {
    const selection = event.selection as [number, number]
    if (!selection) return
    console.log('Range selected:', selection.map(x.invert))
    updateHandles(selection)
  }

  function endBrushed(
    event: d3.D3BrushEvent<unknown>,
    brush: d3.BrushBehavior<unknown>,
    brushGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    defaultSelection: d3.BrushSelection
  ) {
    const selection = event.selection as [number, number]
    if (!selection) {
      brushGroup.call(brush.move, defaultSelection)
      updateHandles(defaultSelection)
    }
  }

  function updateHandles(selection: d3.BrushSelection) {
    svg.value!.selectAll('.range-handle').remove()
    svg.value!.select('#clip-selection').remove()
    if (!selection) return

    const [x0, x1] = selection
    const handleHeight = height

    function drawHandle(xPos: number, isLeft: boolean) {
      const g = svg.value!.append('g').attr('class', 'range-handle').attr('transform', `translate(${xPos},0)`)

      const pathD = isLeft
        ? `M 12 0 v ${handleHeight} M 11 0 V ${handleHeight} M 12 1 h -12 q -2 0, -2 2 v 22 q 0 2 2 2 h 12 z`
        : `M 0 0 v ${handleHeight} M 1 0 V ${handleHeight} M 0 1 h 12 q 2 0, 2 2 v 22 q 0 2 -2 2 h -12 z`

      g.append('path').attr('d', pathD).style('fill', '#7645d9').style('stroke', '#7645d9').style('stroke-width', '3')

      g.append('path').attr('d', 'M 5 7 v 14 M 9 7 v 14').style('stroke', 'white').style('stroke-width', '2')
    }

    drawHandle(x0 as number, true)
    drawHandle(x1 as number, false)

    svg
      .value!.append('clipPath')
      .attr('id', 'clip-selection')
      .append('rect')
      .attr('x', (x0 as number) + 10)
      .attr('width', (x1 as number) - (x0 as number))
      .attr('height', height)
  }
</script>

<style lang="scss">
  .brush .selection {
    fill: rgba(120, 81, 169, 0.2);
    stroke: none;
  }

  .range-handle path {
    fill: red;
    stroke: red;
  }

  .handle.handle--w,
  .handle--e {
    width: 30px;
    fill: transparent;
  }

  .brush .selection {
    fill: rgba(120, 81, 169, 0.9);
    stroke: none;
    clip-path: url(#clip-selection);
  }
</style>
