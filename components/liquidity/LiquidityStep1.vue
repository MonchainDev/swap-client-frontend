<template>
  <div>
    <p v-if="currentStep === 1" class="max-w-[386px] text-sm text-gray-8">
      Choose the tokens you want to provide liquidity for. You can select tokens on all supported networks.
    </p>
    <div class="mt-4 grid grid-cols-2 gap-[21px]">
      <LiquiditySelectToken type="BASE" :is-selected="isToken0Selected" :token="form.token0" :step="currentStep" @select-token="openPopupSelectToken('BASE')" />
      <LiquiditySelectToken
        type="QUOTE"
        :is-selected="isToken1Selected"
        :token="form.token1"
        :step="currentStep"
        @select-token="openPopupSelectToken('QUOTE')"
      />
    </div>
    <div class="mt-8">
      <h4 class="text-2xl font-semibold leading-7">Fee tier</h4>
      <p class="mt-1 text-sm text-gray-8">The amount earned providing liquidity. Choose an amount that suits your risk tolerance and strategy.</p>
      <div class="mt-4 rounded-lg border border-dashed border-gray-6 px-[30px] pb-[33px] pt-[18px]">
        <div class="flex items-center justify-between">
          <span class="text-sm leading-5">The % you will earn in fees</span>
          <span class="text-sm font-bold leading-5">{{ form.feeTier }}%</span>
        </div>
        <div class="mt-7 grid grid-cols-[repeat(4,100px)] gap-4">
          <div
            v-for="item in listFee"
            :key="item.value"
            class="cursor-pointer rounded-lg bg-[#fafafa] px-[13px] pb-[26px] pt-[15px]"
            @click="form.feeTier = item.value"
          >
            <div class="flex items-center gap-[6px]">
              <BaseIcon v-show="form.feeTier === item.value" name="radio-fill" size="24" />
              <BaseIcon v-show="form.feeTier !== item.value" name="radio" size="24" />
              <span class="text-sm font-bold leading-5">{{ item.value }}%</span>
            </div>
            <p class="mt-5 text-xs text-gray-8">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
    <button
      class="bg-linear mt-5 flex h-[67px] w-full items-center justify-center gap-2 rounded-lg text-xl font-semibold uppercase text-white hover:opacity-90 sm:h-[42px] sm:text-sm"
      :disabled="!isToken0Selected || !isToken1Selected"
      :class="{ 'btn-disabled': !isToken0Selected || !isToken1Selected }"
      @click="emit('continue')"
    >
      Continue
    </button>
  </div>
  <PopupSelectToken @select="handleSelectToken" />
</template>

<script lang="ts" setup>
  import type { IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'

  const { form, currentStep } = storeToRefs(useLiquidityStore())
  const { setOpenPopup } = useBaseStore()

  interface IProps {
    isToken0Selected: boolean
    isToken1Selected: boolean
  }

  const emit = defineEmits<{
    continue: []
  }>()

  const _props = withDefaults(defineProps<IProps>(), {
    isToken0Selected: false,
    isToken1Selected: false
  })

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

  const typeCurrent = ref<TYPE_SWAP>('BASE')
  const openPopupSelectToken = (type: TYPE_SWAP) => {
    typeCurrent.value = type
    setOpenPopup('popup-select-token')
  }

  const handleSelectToken = (token: IToken) => {
    if (typeCurrent.value === 'BASE') {
      form.value.token0 = token
      form.value.token1 = token.address === form.value.token1.address ? { name: '', symbol: '', decimals: 0, icon_url: '', address: '' } : form.value.token1
    } else {
      form.value.token1 = token
      form.value.token0 = token.address === form.value.token0.address ? { name: '', symbol: '', decimals: 0, icon_url: '', address: '' } : form.value.token0
    }
  }
</script>

<style lang="scss"></style>
