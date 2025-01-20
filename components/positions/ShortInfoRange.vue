<template>
  <div class="border-base flex items-center justify-between p-6">
    <div class="flex flex-col gap-2">
      <span>Min price: {{ form.minPrice }}</span>
      <span>Max price: {{ form.maxPrice }}</span>
    </div>
    <div class="flex items-center gap-6">
      <span class="text-secondary">{{ form.typeRange === 'FULL' ? 'Full range' : 'Custom range' }}</span>
      <div
        class="flex h-[38px] cursor-pointer items-center justify-center gap-1 rounded-2xl border border-solid border-[transparent] bg-surface3 px-3 text-sm font-medium text-primary hover:opacity-80"
        @click="stepCurrent = 2"
      >
        <BaseIcon name="edit" size="16" />
        <span>Edit</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const { form, stepCurrent } = storeToRefs(usePositionStore())
</script>

<style lang="scss"></style>
