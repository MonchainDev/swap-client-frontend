<template>
  <div class="solid h-fit rounded-3xl border border-surface3 p-4">
    <template v-for="(item, index) in listStep" :key="item.value">
      <div class="grid grid-cols-[32px_1fr] items-center gap-3">
        <span
          class="flex h-8 items-center justify-center rounded-full bg-surface3 text-secondary"
          :class="{ '!bg-primary text-white': item.value === active }"
          >{{ item.value }}</span
        >
        <div class="flex flex-col gap-[2px]">
          <span class="text-sm text-neutral3" :class="{ '!text-secondary': item.value === active }">Step {{ item.value }}</span>
          <span class="text-base text-secondary" :class="{ '!text-primary': item.value === active }">{{ item.description }}</span>
        </div>
      </div>
      <div v-if="index < listStep.length - 1" class="my-2 ml-[15px] h-8 w-[2px] bg-surface3"></div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { IStep } from '~/types/step.type'

  interface IProps {
    listStep: IStep[]
    active: number
  }
  const _props = withDefaults(defineProps<IProps>(), {
    listStep: () => [],
    active: 0
  })
</script>

<style lang="scss"></style>
