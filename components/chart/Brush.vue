<template>
  <defs>
    <linearGradient :id="`${id}-gradient-selection`" x1="0%" y1="100%" x2="100%" y2="100%">
      <stop :stop-color="westHandleColor" />
      <stop :stop-color="eastHandleColor" offset="1" />
    </linearGradient>

    <!-- clips at exactly the svg area -->
    <clipPath :id="`${id}-brush-clip`">
      <rect x="0" y="0" :width="innerWidth" :height="innerHeight" />
    </clipPath>
  </defs>

  <!-- will host the d3 brush -->
  <g ref="brushRef" :clip-path="`url(#${id}-brush-clip)`" @mouseenter="setHovering(true)" @mouseleave="setHovering(false)" />

  <!-- custom brush handles -->
  <template v-if="localBrushExtent">
    <!-- west handle -->
    <g v-if="westHandleInView" :transform="`translate(${Math.max(0, xScale(localBrushExtent[0]))}, 0), scale(${flipWestHandle ? '-1' : '1'}, 1)`">
      <g>
        <path class="handle" :d="brushHandlePath(innerHeight)" :style="{ stroke: '#7645D9', fill: '#7645D9' }" />
        <path class="handle-accent" :d="brushHandleAccentPath()" />
      </g>

      <g class="label-group" :class="{ visible: showLabels || hovering }" :transform="`translate(50,0), scale(${flipWestHandle ? '1' : '-1'}, 1)`">
        <rect class="tooltip-background" y="0" x="-30" height="30" width="60" rx="8" />
        <text class="tooltip" transform="scale(-1, 1)" y="15" dominant-baseline="middle">
          {{ brushLabelValue('w', localBrushExtent[0]) }}
        </text>
      </g>
    </g>

    <!-- east handle -->
    <g v-if="eastHandleInView" :transform="`translate(${xScale(localBrushExtent[1])}, 0), scale(${flipEastHandle ? '-1' : '1'}, 1)`">
      <g>
        <path class="handle" :d="brushHandlePath(innerHeight)" :style="{ stroke: '#7645D9', fill: '#7645D9' }" />
        <path class="handle-accent" :d="brushHandleAccentPath()" />
      </g>

      <g class="label-group" :class="{ visible: showLabels || hovering }" :transform="`translate(50,0), scale(${flipEastHandle ? '-1' : '1'}, 1)`">
        <rect class="tooltip-background" y="0" x="-30" height="30" width="60" rx="8" />
        <text class="tooltip" y="15" dominant-baseline="middle">
          {{ brushLabelValue('e', localBrushExtent[1]) }}
        </text>
      </g>
    </g>

    <!-- Off-screen arrows -->
    <OffScreenHandle v-if="showWestArrow" :color="westHandleColor" />

    <g v-if="showEastArrow" :transform="`translate(${innerWidth}, 0) scale(-1, 1)`">
      <OffScreenHandle :color="eastHandleColor" />
    </g>
  </template>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, nextTick } from 'vue'
  import { brushX, select } from 'd3'
  import type { ScaleLinear, BrushBehavior, D3BrushEvent } from 'd3'

  const props = defineProps({
    id: {
      type: String,
      required: true
    },
    xScale: {
      type: Object as () => ScaleLinear<number, number>,
      required: true
    },
    interactive: {
      type: Boolean,
      required: true
    },
    brushLabelValue: {
      type: Object as PropType<(d: 'w' | 'e', x: number) => string>,
      required: false,
      default: () => (d: 'w' | 'e', x: number) => `${d}:${x}`
    },
    brushExtent: {
      type: Array as () => [number, number],
      required: true
    },
    innerWidth: {
      type: Number,
      required: true
    },
    innerHeight: {
      type: Number,
      required: true
    },
    westHandleColor: {
      type: String,
      required: true
    },
    eastHandleColor: {
      type: String,
      required: true
    }
  })

  const emit = defineEmits(['update:brushExtent'])

  const brushRef = ref<SVGGElement | null>(null)
  let brushBehavior: BrushBehavior<SVGGElement> | null = null

  // States
  const localBrushExtent = ref<[number, number] | null>(props.brushExtent)
  const showLabels = ref(false)
  const hovering = ref(false)

  // Get previous value using our converted hook
  const previousBrushExtent = usePreviousValue(props.brushExtent)

  // Constants
  const FLIP_HANDLE_THRESHOLD_PX = 20
  const BRUSH_EXTENT_MARGIN_PX = 2

  // Methods
  const setHovering = (value: boolean) => {
    hovering.value = value
  }

  // Returns true if every element in `a` maps to the same pixel coordinate as elements in `b`
  const compare = (a: [number, number], b: [number, number], xScale: ScaleLinear<number, number>): boolean => {
    // normalize pixels to 1 decimal
    const aNorm = a.map((x) => xScale(x).toFixed(1))
    const bNorm = b.map((x) => xScale(x).toFixed(1))
    return aNorm.every((v, i) => v === bNorm[i])
  }

  const brushHandlePath = (height: number) =>
    [
      // handle
      `M 0 0`, // move to origin
      `v ${height}`, // vertical line
      'm 1 0', // move 1px to the right
      `V 0`, // second vertical line
      `M 0 1`, // move to origin

      // head
      'h 12', // horizontal line
      'q 2 0, 2 2', // rounded corner
      'v 22', // vertical line
      'q 0 2 -2 2', // rounded corner
      'h -12', // horizontal line
      `z` // close path
    ].join(' ')

  const brushHandleAccentPath = () =>
    [
      'm 5 7', // move to first accent
      'v 14', // vertical line
      'M 0 0', // move to origin
      'm 9 7', // move to second accent
      'v 14', // vertical line
      'z'
    ].join(' ')

  const setBrushExtent = (extent: [number, number], mode: string | undefined) => {
    emit('update:brushExtent', extent, mode)
  }

  const brushed = (event: D3BrushEvent<unknown>) => {
    const { type, selection, mode } = event

    if (!selection) {
      localBrushExtent.value = null
      return
    }

    const scaled = (selection as [number, number]).map(props.xScale.invert) as [number, number]

    // avoid infinite render loop by checking for change
    if (type === 'end' && !compare(props.brushExtent, scaled, props.xScale)) {
      setBrushExtent(scaled, mode)
    }

    localBrushExtent.value = scaled
  }

  // Computed properties
  const flipWestHandle = computed(() => {
    return localBrushExtent.value && props.xScale(localBrushExtent.value[0]) > FLIP_HANDLE_THRESHOLD_PX
  })

  const flipEastHandle = computed(() => {
    return localBrushExtent.value && props.xScale(localBrushExtent.value[1]) > props.innerWidth - FLIP_HANDLE_THRESHOLD_PX
  })

  const showWestArrow = computed(() => {
    return localBrushExtent.value && (props.xScale(localBrushExtent.value[0]) < 0 || props.xScale(localBrushExtent.value[1]) < 0)
  })

  const showEastArrow = computed(() => {
    return localBrushExtent.value && (props.xScale(localBrushExtent.value[0]) > props.innerWidth || props.xScale(localBrushExtent.value[1]) > props.innerWidth)
  })

  const westHandleInView = computed(() => {
    return localBrushExtent.value && props.xScale(localBrushExtent.value[0]) >= 0 && props.xScale(localBrushExtent.value[0]) <= props.innerWidth
  })

  const eastHandleInView = computed(() => {
    return localBrushExtent.value && props.xScale(localBrushExtent.value[1]) >= 0 && props.xScale(localBrushExtent.value[1]) <= props.innerWidth
  })

  // Watch for external brush extent changes
  watch(
    () => props.brushExtent,
    (newExtent) => {
      localBrushExtent.value = newExtent
    },
    { deep: true }
  )

  // Show labels when local brush changes
  watch(
    localBrushExtent,
    () => {
      showLabels.value = true
      setTimeout(() => {
        showLabels.value = false
      }, 1500)
    },
    { deep: true }
  )

  // Initialize the brush
  onMounted(() => {
    nextTick(() => {
      if (!brushRef.value) return

      brushBehavior = brushX<SVGGElement>()
        .extent([
          [Math.max(0 + BRUSH_EXTENT_MARGIN_PX, props.xScale(0)), 0],
          [props.innerWidth - BRUSH_EXTENT_MARGIN_PX, props.innerHeight]
        ])
        .handleSize(30)
        .filter(() => props.interactive)
        .on('brush end', brushed)

      brushBehavior(select(brushRef.value))

      if (previousBrushExtent.value && compare(props.brushExtent, previousBrushExtent.value, props.xScale)) {
        select(brushRef.value)
          .transition()
          .call(brushBehavior.move as any, props.brushExtent.map(props.xScale))
      }

      // brush linear gradient
      select(brushRef.value)
        .selectAll('.selection')
        .attr('stroke', 'none')
        .attr('fill-opacity', '0.1')
        .attr('height', '180')
        .attr('fill', `url(#${props.id}-gradient-selection)`)
    })
  })

  // Update brush when xScale changes
  watch(
    () => [props.xScale, props.brushExtent, props.innerWidth, props.innerHeight],
    () => {
      nextTick(() => {
        if (!brushRef.value || !brushBehavior) return

        brushBehavior.extent([
          [Math.max(0 + BRUSH_EXTENT_MARGIN_PX, props.xScale(0)), 0],
          [props.innerWidth - BRUSH_EXTENT_MARGIN_PX, props.innerHeight]
        ])

        brushBehavior.move(select(brushRef.value) as any, props.brushExtent.map(props.xScale) as any)
      })
    },
    { deep: true }
  )

  // OffScreenHandle Component
  // const OffScreenHandle = defineComponent({
  //   props: {
  //     color: {
  //       type: String,
  //       required: true
  //     },
  //     size: {
  //       type: Number,
  //       default: 10
  //     },
  //     margin: {
  //       type: Number,
  //       default: 10
  //     }
  //   },
  //   setup(props) {
  //     return () => (
  //       <polygon
  //         points={`0 0, ${props.size} ${props.size}, 0 ${props.size}`}
  //         transform={` translate(${props.size + props.margin}, ${props.margin}) rotate(45) `}
  //         fill={props.color}
  //         stroke={props.color}
  //         stroke-width="4"
  //         stroke-linejoin="round"
  //       />
  //       />
  //     )
  //   }
  // })
</script>

<style scoped>
  .handle {
    cursor: ew-resize;
    pointer-events: none;
    stroke-width: 3;
  }

  .handle-accent {
    cursor: ew-resize;
    pointer-events: none;
    stroke-width: 1.5;
    stroke: #7645d9;
    opacity: 1;
  }

  .label-group {
    opacity: 0;
    transition: opacity 300ms;
  }

  .label-group.visible {
    opacity: 1;
  }

  .tooltip-background {
    fill: #7645d9;
  }

  .tooltip {
    text-anchor: middle;
    font-size: 13px;
    fill: #7645d9;
  }
</style>
