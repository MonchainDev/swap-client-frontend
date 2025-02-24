<template>
  <div class="h-fit">
    <template v-for="(item, index) in listStep" :key="item.value">
      <div class="flex items-center gap-4">
        <span
          class="flex size-12 items-center justify-center rounded-full bg-[#DADADA] text-gray-7"
          :class="{ '!bg-[#1573FE] text-white': item.value === active }"
          >{{ item.value }}</span
        >
        <div class="flex flex-col gap-[2px]">
          <span class="text-xs text-gray-8">Step {{ item.value }}</span>
          <span class="text-sm font-semibold text-gray-7" :class="{ '!text-primary': item.value === active }">{{ item.description }}</span>
        </div>
      </div>
      <div v-if="index < listStep.length - 1" class="my-3 ml-[23px] h-[55px] w-[2px] border-l border-dashed border-[#D9D9D9]"></div>
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
