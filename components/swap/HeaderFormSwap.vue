<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-col">
      <div class="flex items-center gap-6 sm:gap-2">
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
      <span v-if="stepSwap === 'SELECT_TOKEN'" class="text-sm text-gray-8">Securely exchange tokens without intermediaries.</span>
    </div>
    <ChooseNetwork v-if="stepSwap === 'SELECT_TOKEN'" />
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
