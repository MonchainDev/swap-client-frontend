<template>
  <div class="rounded-br-lg rounded-tr-lg bg-white pl-8 pr-[22px] pt-[21px] shadow-sm">
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
    </div>
    <p class="mt-2 text-sm">Current Price: <span class="text-hyperlink">268.367</span> {{ form.token0.symbol }} per {{ form.token1.symbol }}</p>
    <div class="mt-5">
      <img src="/demo-chart.png" alt="" />
    </div>
    <div class="mt-6 flex flex-col gap-5">
      <div class="grid grid-cols-2">
        <InputPriceRange v-model:amount="form.minPrice" :active-range="activeRange" type="MIN" class="rounded-bl-lg rounded-tl-lg" />
        <InputPriceRange v-model:amount="form.maxPrice" :active-range="activeRange" type="MIN" class="rounded-br-lg rounded-tr-lg border-l-0" />
      </div>
      <div class="grid grid-cols-4 gap-3">
        <div
          v-for="item in listSelectRange"
          :key="item"
          class="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-solid border-hyperlink text-sm font-semibold text-hyperlink"
        >
          {{ item }}%
        </div>
        <div class="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-solid border-hyperlink text-sm font-semibold text-hyperlink">
          Full range
        </div>
      </div>
    </div>
    <BaseButton class="mt-[33px] w-full text-xl font-semibold">ENABLE {{ form.token1.symbol }}</BaseButton>
    <!-- <BaseButton class="mt-4 w-full text-xl font-semibold">ADD</BaseButton> -->
  </div>
</template>

<script lang="ts" setup>
  import type { TYPE_SWAP } from '~/types/swap.type'

  export type INPUT_PRICE = 'MIN' | 'MAX'
  interface IProps {
    isToken0Selected: boolean
    isToken1Selected: boolean
  }

  const _props = withDefaults(defineProps<IProps>(), {
    isToken0Selected: false,
    isToken1Selected: false
  })
  const activeRange = ref<TYPE_SWAP>('BASE')

  const { form } = storeToRefs(useLiquidityStore())

  const listSelectRange = [5, 10, 20]
</script>

<style lang="scss"></style>
