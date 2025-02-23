<template>
  <div class="mt-[33px] flex flex-col gap-4">
    <BaseButton v-if="isInvalidPair" type="outline" size="md" disabled class="w-full text-xl font-semibold">INVALID PAIR</BaseButton>
    <BaseButton
      v-if="isShowEnterAmount || isInsufficientBalanceA || isInsufficientBalanceB"
      type="outline"
      size="md"
      disabled
      class="w-full text-xl font-semibold"
      >{{ title }}</BaseButton
    >
    <BaseButton v-if="isShowBtnEnable0" :loading="props.loading0" size="md" class="w-full text-xl font-semibold" @click="emit('approve', 'BASE')"
      >ENABLE {{ tokenA?.symbol }}</BaseButton
    >
    <BaseButton v-if="isShowBtnEnable1" :loading="props.loading1" size="md" class="w-full text-xl font-semibold" @click="emit('approve', 'QUOTE')"
      >ENABLE {{ tokenB?.symbol }}</BaseButton
    >
    <BaseButton v-if="isShowBtnAdd" size="md" class="w-full text-xl font-semibold" @click="emit('add')"> ADD </BaseButton>
  </div>
</template>

<script lang="ts" setup>
  import Decimal from 'decimal.js'
  import type { TYPE_SWAP } from '~/types/swap.type'

  interface IProps {
    loading0: boolean
    loading1: boolean
  }

  const props = withDefaults(defineProps<IProps>(), {
    loading0: false,
    loading1: false
  })

  const { tokenA, tokenB } = useV3DerivedInfo()
  const { feeAmount, form, balance0, balance1, startPriceTypedValue, allowance0, allowance1 } = storeToRefs(useLiquidityStore())

  const emit = defineEmits<{
    approve: [type: TYPE_SWAP]
    add: []
  }>()

  const isInvalidPair = computed(() => {
    return !tokenA.value || !tokenB.value || !feeAmount.value
  })

  const isInsufficientBalanceA = computed(() => {
    const amountA = form.value.amountDeposit0 || 0
    const balanceA = balance0.value?.formatted || 0
    return new Decimal(amountA).greaterThan(balanceA)
  })

  const isInsufficientBalanceB = computed(() => {
    const amountB = form.value.amountDeposit1 || 0
    const balanceB = balance1.value?.formatted || 0
    return new Decimal(amountB).greaterThan(balanceB)
  })

  const titleInsufficientBalance = computed(() => {
    return isInsufficientBalanceA.value ? `Insufficient ${tokenA.value?.symbol} balance` : `Insufficient ${tokenB.value?.symbol} balance`
  })

  //  isInvalidPair = false, start current price = '', amount deposit A = '', amount deposit B = ''
  const isShowEnterAmount = computed(() => {
    return !isInvalidPair.value && (!startPriceTypedValue.value || !form.value.amountDeposit0 || !form.value.amountDeposit1)
  })

  const title = computed(() => {
    return isShowEnterAmount.value ? 'Enter an amount' : titleInsufficientBalance.value
  })

  const isNeedAllowance0 = computed(() => {
    const allowance = allowance0.value?.toString() || '0'
    return allowance0.value === BigInt(0) || new Decimal(allowance).lessThan(form.value.amountDeposit0 || 0)
  })

  const isNeedAllowance1 = computed(() => {
    const allowance = allowance1.value?.toString() || '0'
    return allowance1.value === BigInt(0) || new Decimal(allowance).lessThan(form.value.amountDeposit1 || 0)
  })

  const isShowBtnEnable0 = computed(() => {
    return !isInvalidPair.value && !isShowEnterAmount.value && !isInsufficientBalanceA.value && isNeedAllowance0.value
  })

  const isShowBtnEnable1 = computed(() => {
    return !isInvalidPair.value && !isShowEnterAmount.value && !isInsufficientBalanceB.value && isNeedAllowance1.value
  })

  const isShowBtnAdd = computed(() => {
    return (
      !isInvalidPair.value &&
      !isShowEnterAmount.value &&
      !isInsufficientBalanceA.value &&
      !isInsufficientBalanceB.value &&
      !isShowBtnEnable0.value &&
      !isShowBtnEnable1.value
    )
  })
</script>

<style lang="scss"></style>
