<template>
  <span class="nuxt-icon" :style="{ 'font-size': `${size}px` }" :class="{ 'nuxt-icon--fill': filled }" @click="emit('click')" v-html="icon" />
</template>

<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      name: string
      size?: string | number
      filled?: boolean
    }>(),
    { filled: false, size: 28 }
  )
  const emit = defineEmits<{
    click: []
  }>()
  const icon = ref('')

  watchEffect(async () => {
    try {
      const iconsImport = import.meta.glob('assets/icons/**/**.svg', {
        as: 'raw',
        eager: false
      })
      const rawIcon = await iconsImport[`/assets/icons/${props.name}.svg`]()
      icon.value = rawIcon
    } catch {
      console.error(`[nuxt-icons] Icon '${props.name}' doesn't exist in 'assets/icons'`)
    }
  })
</script>

<style>
  .nuxt-icon svg {
    width: 1em;
    height: 1em;
    vertical-align: middle;
  }
  .nuxt-icon.nuxt-icon--fill,
  .nuxt-icon.nuxt-icon--fill * {
    fill: currentColor !important;
  }
</style>
