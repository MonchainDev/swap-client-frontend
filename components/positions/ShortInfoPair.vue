<template>
  <div class="border-base flex h-[86px] items-center justify-between px-6">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <div class="relative size-7">
          <div class="absolute left-0 top-0 w-[13px] overflow-hidden">
            <div class="flex size-7">
              <img :src="form.token0.icon_url" alt="logo token" class="z-[1] object-contain" @error="handleImageError($event)" />
            </div>
          </div>
          <div class="absolute right-0 top-0 flex w-[13px] flex-row-reverse overflow-hidden">
            <div class="relative flex h-7 w-7 flex-shrink-0">
              <img :src="form.token1.icon_url" alt="logo token" class="z-[1] object-contain" @error="handleImageError($event)" />
            </div>
          </div>
        </div>
      </div>
      <div class="flex gap-2 text-lg font-medium">
        <span>{{ form.token0.symbol }}</span>
        <span>/</span>
        <span>{{ form.token1.symbol }}</span>
      </div>
      <span class="rounded bg-surface px-[6px] py-[2px] text-xs font-medium lowercase text-secondary">{{ form.feeTier }}%</span>
    </div>
    <div
      class="flex h-[38px] cursor-pointer items-center justify-center gap-1 rounded-2xl border border-solid border-[transparent] bg-surface3 px-3 text-sm font-medium text-primary hover:opacity-80"
      @click="stepCurrent = 1"
    >
      <BaseIcon name="edit" size="16" />
      <span>Edit</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const { form, stepCurrent } = storeToRefs(usePositionStore())

  const { handleImageError } = useErrorImage()
</script>

<style lang="scss"></style>
