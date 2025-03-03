<template>
  <div class="flex gap-6 text-sm font-semibold text-gray-7">
    <span
      v-for="(item, index) in props.list"
      :key="index"
      class="cursor-pointer pb-[10px] hover:text-hyperlink"
      :class="{ 'tab-active': model === item.value }"
      @click="model = item.value"
      >{{ item.title }}</span
    >
  </div>
</template>

<script lang="ts" setup>
  import type { ITab } from '~/types/component.type'

  interface IProps {
    list: ITab[]
  }

  const props = withDefaults(defineProps<IProps>(), {
    list: () => []
  })

  const model = defineModel<number | string>('model', {
    default: ''
  })
</script>

<style lang="scss" scoped>
  .tab-active {
    position: relative;
    color: var(--color-hyperlink);
    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 4px;
      border-radius: 2px;
      background-color: #1573fe;
    }
  }
</style>
