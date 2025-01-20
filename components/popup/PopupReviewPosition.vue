<template>
  <BasePopup name="popup-review-position" width="420" title="Creating position">
    <div class="px-4 pb-4">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-2xl text-primary">{{ form.token0.symbol }} / {{ form.token1.symbol }}</span>
            <span class="w-fit rounded bg-surface px-[6px] py-[2px] text-xs font-medium text-secondary">{{ form.feeTier }}%</span>
          </div>
          <img :src="form.token0.icon_url" alt="logo" class="size-9" @error="handleImageError($event)" />
        </div>
        <div class="grid grid-cols-2 gap-5">
          <div class="flex flex-col gap-2">
            <span class="text-sm text-secondary">Min</span>
            <span class="text-sm text-primary">{{ form.minPrice }} {{ form.token1.symbol }}/{{ form.token0.symbol }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-sm text-secondary">Max</span>
            <span class="text-sm text-primary">{{ form.maxPrice }} {{ form.token1.symbol }}/{{ form.token0.symbol }}</span>
          </div>
        </div>
      </div>
      <div class="mt-8 flex flex-col gap-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex flex-1 flex-col gap-1">
            <span class="text-sm text-secondary">Depositing</span>
            <span class="text-lg text-primary">{{ form.amountDeposit0 }} {{ form.token0.symbol }}</span>
            <span class="text-sm text-secondary">$0</span>
          </div>
          <img :src="form.token0.icon_url" alt="logo" class="size-9" @error="handleImageError($event)" />
        </div>
        <div class="flex items-center justify-between gap-2">
          <div class="flex flex-1 flex-col gap-1">
            <span class="text-lg text-primary">{{ form.amountDeposit1 }} {{ form.token1.symbol }}</span>
            <span class="text-sm text-secondary">$0</span>
          </div>
          <img :src="form.token1.icon_url" alt="logo" class="size-9" @error="handleImageError($event)" />
        </div>
      </div>
      <div class="my-6 h-[1px] w-full">
        <div class="h-full bg-surface3"></div>
      </div>
      <div class="flex items-center justify-between text-sm text-secondary">
        <span>Network cost </span>
        <span class="text-primary">$100.10</span>
      </div>
      <BaseButton class="mt-6 w-full text-lg">Create</BaseButton>
    </div>
  </BasePopup>
</template>

<script lang="ts" setup>
  const { form } = storeToRefs(usePositionStore())
  const { handleImageError } = useErrorImage()
</script>

<style lang="scss"></style>
