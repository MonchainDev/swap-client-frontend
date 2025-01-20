<template>
  <div class="grid grid-cols-1 gap-y-8 rounded-3xl border border-solid border-surface3 p-6">
    <div class="flex flex-col">
      <span class="text-lg leading-6">Select pair</span>
      <span class="text-sm text-secondary">Choose the tokens you want to provide liquidity for. You can select tokens on all supported networks.</span>

      <div class="mt-3 grid grid-cols-2 gap-x-4 sm:grid-cols-1 sm:gap-y-4">
        <div
          class="h-[50px] cursor-pointer rounded-2xl border border-solid border-[transparent] bg-surface3 py-3 pl-4 pr-3 hover:opacity-[0.8]"
          @click="openPopupSelectToken('BASE')"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <img :src="form.token0.icon_url" alt="token 0 logo" class="size-6 rounded-full" @error="handleImageError" />
              <span class="font-medium">{{ form.token0.symbol }}</span>
            </div>
            <BaseIcon name="arrow" class="-rotate-90" />
          </div>
        </div>
        <div
          class="h-[50px] cursor-pointer rounded-2xl border border-solid border-[transparent] bg-surface3 py-3 pl-4 pr-3 hover:opacity-[0.8]"
          :class="{ '!bg-primary': !isToken1Selected }"
          @click="openPopupSelectToken('QUOTE')"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <template v-if="isToken1Selected">
                <img :src="form.token1.icon_url" alt="token 0 logo" class="size-6 rounded-full" @error="handleImageError($event)" />
                <span class="font-medium">{{ form.token1.symbol }}</span>
              </template>
              <template v-else>
                <span class="font-medium text-white">Choose token</span>
              </template>
            </div>
            <BaseIcon name="arrow" class="-rotate-90" :class="{ '!text-secondary': !isToken1Selected }" />
          </div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-6">
      <div class="flex flex-col">
        <span class="text-lg leading-6">Fee tier</span>
        <span class="text-sm text-secondary">The amount earned providing liquidity. Choose an amount that suits your risk tolerance and strategy.</span>
      </div>
      <div class="grid grid-cols-1 gap-2">
        <div class="flex items-center justify-between rounded-xl border border-solid border-surface3 px-4 py-3">
          <div class="flex flex-col gap-y-1">
            <span>{{ form.feeTier }}% fee tier</span>
            <span class="text-sm text-secondary">The % you will earn in fees </span>
          </div>
          <div
            class="flex h-[38px] cursor-pointer items-center justify-center gap-1 rounded-2xl border border-solid border-[transparent] bg-surface3 px-3 text-xs hover:opacity-80"
            @click="isOpen = !isOpen"
          >
            <span> {{ isOpen ? 'Less' : 'More' }}</span>
            <BaseIcon name="arrow" class="-rotate-90" size="16" :class="{ '!rotate-90': isOpen }" />
          </div>
        </div>
        <div v-if="isOpen" class="grid grid-cols-4 gap-[10px] sm:grid-cols-2">
          <div
            v-for="item in listFee"
            :key="item.value"
            :class="{ 'bg-surface3': form.feeTier === item.value }"
            class="grid cursor-pointer grid-cols-1 gap-2 rounded-xl border border-solid border-surface3 p-3"
            @click="form.feeTier = item.value"
          >
            <div class="flex justify-between">
              <span class="text-sm font-medium">{{ item.value }}%</span>
              <div v-if="item.value === form.feeTier" class="flex size-4 items-center justify-center rounded-full bg-primary">
                <BaseIcon name="tick" size="14" class="text-white" />
              </div>
            </div>
            <span class="text-xs">{{ item.description }}</span>
            <span class="text-xs text-secondary">0 TVL</span>
          </div>
        </div>
      </div>
      <BaseButton :disabled="!isToken1Selected" type="black" class="text-white" @click="emit('continue')">Continue</BaseButton>
    </div>
  </div>
  <PopupSelectToken @select="handleSelectToken" />
</template>

<script lang="ts" setup>
  import type { IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'

  const { form } = storeToRefs(usePositionStore())
  const isOpen = ref(false)
  const listFee = [
    {
      value: 0.01,
      description: 'Best for very stable pairs.'
    },
    {
      value: 0.05,
      description: 'Best for stable pairs.'
    },
    {
      value: 0.3,
      description: 'Best for most pairs.'
    },
    {
      value: 1,
      description: 'Best for exotic pairs.'
    }
  ]
  const { setOpenPopup } = useBaseStore()

  const isToken1Selected = computed(() => form.value.token1.symbol)

  const emit = defineEmits<{
    continue: []
  }>()

  const typeCurrent = ref<TYPE_SWAP>('BASE')
  const openPopupSelectToken = (type: TYPE_SWAP) => {
    typeCurrent.value = type
    setOpenPopup('popup-select-token')
  }

  const handleSelectToken = (token: IToken) => {
    if (typeCurrent.value === 'BASE') {
      form.value.token0 = token
    } else {
      form.value.token1 = token
    }
  }

  const { handleImageError } = useErrorImage()
</script>

<style lang="scss"></style>
