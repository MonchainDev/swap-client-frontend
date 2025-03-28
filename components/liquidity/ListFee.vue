<template>
  <div class="mt-8">
    <div class="flex items-center justify-between">
      <h4 class="text-lg font-semibold leading-7 sm:text-base">Fee tier</h4>
      <BaseLoadingButton v-if="isPendingAll && isToken0Selected && isToken1Selected" />
    </div>
    <template v-if="isToken0Selected && isToken1Selected">
      <div v-if="!isPendingAll" class="mt-4 grid grid-cols-[repeat(4,100px)] gap-5 sm:grid-cols-2">
        <div
          v-for="(item, index) in LIST_FEE_AMOUNT"
          :key="item.value"
          class="flex cursor-pointer flex-col items-center gap-5 rounded-lg border border-solid border-gray-3 bg-[#fafafa] px-[13px] pb-[26px] pt-[15px]"
          @click="handleSelectFee(item)"
        >
          <div class="flex items-center gap-[6px]">
            <BaseIcon v-show="feeAmount === item.value" name="radio-fill" size="24" />
            <BaseIcon v-show="feeAmount !== item.value" name="radio" size="24" />
            <span class="text-sm font-bold leading-5">{{ item.value / 10000 }}%</span>
          </div>
          <p class="text-center text-xs text-gray-8">{{ listPoolExits[index] ? 'Created' : 'Not created' }}</p>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="mt-4 grid grid-cols-[repeat(4,100px)] gap-5 sm:grid-cols-2">
        <div
          v-for="(item, index) in LIST_FEE_AMOUNT"
          :key="item.value"
          class="flex cursor-pointer flex-col items-center gap-5 rounded-lg border border-solid border-gray-3 bg-[#fafafa] px-[13px] pb-[26px] pt-[15px]"
          @click="handleSelectFee(item)"
        >
          <div class="flex items-center gap-[6px]">
            <BaseIcon v-show="feeAmount === item.value" name="radio-fill" size="24" />
            <BaseIcon v-show="feeAmount !== item.value" name="radio" size="24" />
            <span class="text-sm font-bold leading-5">{{ item.value / 10000 }}%</span>
          </div>
          <p class="text-center text-xs text-gray-8">{{ listPoolExits[index] ? 'Created' : 'Not created' }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { LIST_FEE_AMOUNT } from '~/constant'

  interface IProps {
    isToken0Selected: boolean
    isToken1Selected: boolean
  }

  const _props = withDefaults(defineProps<IProps>(), {
    isToken0Selected: false,
    isToken1Selected: false
  })

  const { feeAmount, form, baseCurrency, quoteCurrency, leftRangeTypedValue, rightRangeTypedValue } = storeToRefs(useLiquidityStore())
  const { resetFiled } = useLiquidityStore()
  const { currentNetwork } = storeToRefs(useBaseStore())

  const { listPoolExits, isPendingAll } = useFetchPool()

  const handleSelectFee = async (item: { value: number }) => {
    if (baseCurrency.value?.wrapped.address && quoteCurrency.value?.wrapped.address) {
      resetFiled()
      feeAmount.value = item.value
      rightRangeTypedValue.value = undefined
      leftRangeTypedValue.value = undefined

      const path = `/add/${form.value.token0.address}/${form.value.token1.address}/${item.value}?chain=${currentNetwork.value.network}`
      history.pushState(null, '', path)
    }
  }
</script>

<style lang="scss"></style>
