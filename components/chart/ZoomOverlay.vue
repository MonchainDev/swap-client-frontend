<template>
  <rect ref="overlayRef" class="zoom-overlay" :width="width" :height="height" />
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, defineProps, defineExpose } from 'vue'
  import type { ZoomBehavior, ZoomTransform } from 'd3'
  import { select, zoom } from 'd3'
  import type { ZoomLevels } from '~/types'
  // import type { ZoomLevels } from './types'

  const props = defineProps<{
    width: number
    height: number
    zoomLevels?: ZoomLevels
    onZoom?: (transform: ZoomTransform) => void
  }>()

  const overlayRef = ref<SVGRectElement | null>(null)
  const zoomBehavior = ref<ZoomBehavior<Element, unknown>>()

  // Initialize zoom behavior
  onMounted(() => {
    if (!overlayRef.value || !props.zoomLevels) return

    zoomBehavior.value = zoom()
      .scaleExtent([props.zoomLevels.min, props.zoomLevels.max])
      .extent([
        [0, 0],
        [props.width, props.height]
      ])
      .on('zoom', ({ transform }: { transform: ZoomTransform }) => {
        if (props.onZoom) props.onZoom(transform)
      })

    //@ts-ignore
    select(overlayRef.value).call(zoomBehavior.value)
  })

  // Watch for changes in dependencies
  watch([() => props.width, () => props.height, () => props.zoomLevels], () => {
    if (!overlayRef.value || !props.zoomLevels || !props.onZoom) return

    zoomBehavior.value = zoom()
      .scaleExtent([props.zoomLevels.min, props.zoomLevels.max])
      .extent([
        [0, 0],
        [props.width, props.height]
      ])
      .on('zoom', ({ transform }: { transform: ZoomTransform }) => {
        if (props.onZoom) props.onZoom(transform)
      })
    //@ts-ignore

    select(overlayRef.value).call(zoomBehavior.value)
  })

  // Methods to be exposed to parent components
  const zoomIn = () => {
    console.log('overlayRef', overlayRef.value)
    console.log('zoomBehavior', zoomBehavior.value?.scaleBy)

    if (!overlayRef.value || !zoomBehavior.value) return
    //@ts-ignore
    select(overlayRef.value).transition().call(zoomBehavior.value?.scaleBy, 2)
  }

  const zoomOut = () => {
    if (!overlayRef.value || !zoomBehavior.value) return
    //@ts-ignore
    select(overlayRef.value).transition().call(zoomBehavior.value.scaleBy, 0.5)
  }

  const zoomInitial = () => {
    if (!overlayRef.value || !zoomBehavior.value) return
    //@ts-ignore
    select(overlayRef.value).transition().call(zoomBehavior.value.scaleTo, 0.5)
  }

  const zoomReset = () => {
    if (!overlayRef.value || !zoomBehavior.value) return
    //@ts-ignore
    select(overlayRef.value).call(zoomBehavior.value.transform, zoomIdentity.translate(0, 0).scale(1)).transition().call(zoomBehavior.value.scaleTo, 0.5)
  }

  // Expose methods to parent components
  defineExpose({
    zoomIn,
    zoomOut,
    zoomInitial,
    zoomReset,
    overlayElement: overlayRef
  })
</script>

<style scoped>
  .zoom-overlay {
    fill: transparent;
    cursor: grab;
  }

  .zoom-overlay:active {
    cursor: grabbing;
  }
</style>
