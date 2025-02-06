<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-6">
      <BaseIcon
        v-if="stepSwap === 'CONFIRM_SWAP'"
        name="arrow-down"
        size="24"
        class="rotate-90 cursor-pointer text-primary"
        :class="{ 'pointer-events-none cursor-default': isSwapping || isConfirmApprove }"
        @click="stepSwap = 'SELECT_TOKEN'"
      />
      <span class="text-2xl font-semibold leading-7 sm:text-lg">{{ title }}</span>
    </div>
    <div v-if="stepSwap === 'SELECT_TOKEN'" class="flex items-center gap-3">
      <span class="text-sm font-semibold text-gray-6 sm:hidden">Choose network</span>
      <ChooseNetwork />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { StepSwap } from './FormSwap.vue'

  interface IProps {
    isSwapping: boolean
    isConfirmApprove: boolean
    title: string
  }

  const _props = withDefaults(defineProps<IProps>(), {
    isSwapping: false,
    isConfirmApprove: false,
    title: 'Swap'
  })

  const stepSwap = defineModel<StepSwap>('stepSwap', { default: 'SELECT_TOKEN' })
</script>

<style lang="scss"></style>
