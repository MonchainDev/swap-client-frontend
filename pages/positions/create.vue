<template>
  <div class="mx-auto mt-6 max-w-[1200px] px-10 pb-10 sm:px-3 sm:pb-6">
    <h1 class="text-4xl font-medium leading-[46px]">New position</h1>
    <div class="mt-8 grid grid-cols-[360px_1fr] gap-20 sm:grid-cols-1 sm:gap-0">
      <TheStep :list-step="listStep" :active="active" class="sm:hidden" />
      <KeepAlive>
        <component :is="component" @continue="clickContinue" @review="handleReview" />
      </KeepAlive>
    </div>
  </div>
  <PopupReviewPosition />
</template>

<script lang="ts" setup>
  import CreatePositionStep1 from '~/components/positions/CreatePositionStep1.vue'
  import CreatePositionStep2 from '~/components/positions/CreatePositionStep2.vue'
  import CreatePositionStep3 from '~/components/positions/CreatePositionStep3.vue'
  import type { IStep } from '~/types/step.type'

  definePageMeta({
    middleware: ['reset-form-create-position']
  })
  useHead({
    title: 'Manage pool liquidity'
  })

  const listStep: IStep[] = [
    {
      value: 1,
      description: 'Select token pair and fees'
    },
    {
      value: 2,
      description: 'Set price range'
    },
    {
      value: 3,
      description: 'Enter deposit amounts'
    }
  ]
  const { stepCurrent: active } = storeToRefs(usePositionStore())
  const { setOpenPopup } = useBaseStore()

  const component = computed(() => {
    switch (active.value) {
      case 1:
        return CreatePositionStep1

      case 2:
        return CreatePositionStep2

      default:
        return CreatePositionStep3
    }
  })

  const clickContinue = () => {
    active.value++
  }

  const handleReview = () => {
    setOpenPopup('popup-review-position')
  }
</script>

<style lang="scss"></style>
