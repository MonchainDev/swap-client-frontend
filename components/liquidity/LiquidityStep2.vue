<template>
  <div class="mt-[30px]">
    <div class="grid grid-cols-[214px_214px_1fr] gap-[19px]">
      <LiquiditySelectToken is-selected :token="form.token0" type="BASE" :step="currentStep" class="bg-[#F5F5F5]" />
      <LiquiditySelectToken is-selected :token="form.token1" type="QUOTE" :step="currentStep" class="bg-[#F5F5F5]" />
      <div class="flex h-[55px] w-[50px] flex-col items-center justify-center rounded-lg bg-[#E3EEFF]">
        <span class="text-sm"> Fee</span>
        <span class="text-base text-hyperlink"> {{ form.feeTier }}%</span>
      </div>
    </div>
    <div class="price-range relative mt-7">
      <div class="flex items-center gap-3">
        <span class="text-lg font-semibold leading-7">Set price range</span>
        <div class="flex cursor-pointer items-center gap-2" @click="activeRange = 'BASE'">
          <BaseIcon :name="activeRange === 'BASE' ? 'radio-fill' : 'radio'" size="24" />
          <span class="text-base">{{ form.token0.symbol }}</span>
        </div>

        <div class="flex cursor-pointer items-center gap-2" @click="activeRange = 'QUOTE'">
          <BaseIcon :name="activeRange === 'QUOTE' ? 'radio-fill' : 'radio'" size="24" />
          <span class="text-base">{{ form.token1.symbol }}</span>
        </div>
        <div class="clip-path" />
        <div class="flex gap-4 text-sm font-semibold text-gray-7">
          <span class="cursor-pointer hover:text-hyperlink" :class="{ 'tab-active': form.typeRange === 'FULL' }" @click="form.typeRange = 'FULL'"
            >Full range</span
          >
          <span class="cursor-pointer hover:text-hyperlink" :class="{ 'tab-active': form.typeRange === 'CUSTOM' }" @click="form.typeRange = 'CUSTOM'"
            >Custom range</span
          >
        </div>
      </div>
    </div>
    <div class="mt-6">
      <div class="grid grid-cols-2">
        <InputPriceRange v-model:amount="form.minPrice" :active-range="activeRange" type="MIN" class="rounded-bl-lg rounded-tl-lg" />
        <InputPriceRange v-model:amount="form.maxPrice" :active-range="activeRange" type="MIN" class="rounded-br-lg rounded-tr-lg border-l-0" />
      </div>
    </div>
    <div class="mt-5 grid grid-cols-2 gap-4">
      <BaseButton type="outline">BACK</BaseButton>
      <BaseButton type="linear" class="!text-white">CONTINUE</BaseButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { TYPE_SWAP } from '~/types/swap.type'

  const { form, currentStep } = storeToRefs(useLiquidityStore())
  export type INPUT_PRICE = 'MIN' | 'MAX'
  const activeRange = ref<TYPE_SWAP>('BASE')
</script>

<style lang="scss" scoped>
  .price-range {
    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -32px;
      width: 581px;
      height: 1px;
      background-color: #eee;
    }
    &::after {
      bottom: 0;
      top: unset;
    }
  }
  .tab-active {
    position: relative;
    color: var(--color-hyperlink);
    &::before {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 4px;
      border-radius: 2px;
      background-color: #1573fe;
    }
  }
  .clip-path {
    width: 18px;
    height: 70px;
    background: #eee;
    border-right: 1px solid #eee;
    border-left: 1px solid #eee;
    clip-path: polygon(0% 0%, 50% 50%, 0% 100%, 10% 100%, 60% 50%, 10% 0%);
    margin-left: 15px !important;
  }
</style>
