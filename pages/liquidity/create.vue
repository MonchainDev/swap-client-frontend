<template>
  <div class="mt-10 bg-[#f5f5f5]">
    <div class="flex items-center justify-center gap-[79px]">
      <div class="w-[581px] rounded-lg bg-white px-8 py-[21px] shadow-sm">
        <div class="flex items-center justify-between" :class="{ '!justify-normal gap-4': currentStep !== 1 }">
          <BaseIcon v-if="currentStep !== 1" name="arrow-down" size="24" class="rotate-90 cursor-pointer text-primary" @click="currentStep -= 1" />
          <h4 class="text-2xl font-semibold leading-7">{{ formatTitle }}</h4>
          <ChooseNetwork v-if="currentStep === 1" />
        </div>
        <KeepAlive>
          <component :is="component" :is-token0-selected :is-token1-selected @continue="handleContinue" />
        </KeepAlive>
      </div>
      <div class="flex max-w-[357px] flex-col gap-8">
        <TheStep :list-step="listStep" :active="currentStep" class="sm:hidden" />
        <p class="text-sm text-gray-8">
          <span class="text-[#F99F01]">Ads.</span>
          Earn Mon by New Program: Unlock Your True Earning Potential with This Amazing Opportunity
          <span class="text-[#049C6B]">HERE!</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import LiquidityStep1 from '~/components/liquidity/LiquidityStep1.vue'
  import LiquidityStep2 from '~/components/liquidity/LiquidityStep2.vue'
  import type { IStep } from '~/types/step.type'

  const { form, currentStep } = storeToRefs(useLiquidityStore())

  const listStep: IStep[] = [
    {
      value: 1,
      description: 'Select token pair and fees'
    },
    {
      value: 2,
      description: 'Select price range'
    },
    {
      value: 3,
      description: 'Enter deposit amounts'
    },
    {
      value: 4,
      description: 'Confirm'
    }
  ]

  const formatTitle = computed(() => {
    return currentStep.value === 1 ? 'Step 1: Select pair' : currentStep.value === 2 ? 'Step 2: Select price range' : 'Step 3: Enter deposit amounts'
  })

  const isToken0Selected = computed(() => form.value.token0.symbol !== '')
  const isToken1Selected = computed(() => form.value.token1.symbol !== '')

  const component = computed(() => {
    switch (currentStep.value) {
      case 1:
        return LiquidityStep1

      case 2:
        return LiquidityStep2

      default:
        return LiquidityStep1
    }
  })

  const handleContinue = () => {
    currentStep.value += 1
  }
</script>

<style lang="scss" scoped>
  .bg-linear {
    background: linear-gradient(91deg, #790c8b 17.53%, #1573fe 84.87%);
  }
</style>
