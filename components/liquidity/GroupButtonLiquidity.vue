<template>
  <div class="mt-[33px] flex flex-col gap-4">
    <template v-if="isConnected">
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
      <BaseButton
        v-if="isShowBtnAdd"
        :loading="props.loadingAdd"
        :disabled="isDisabledAdd"
        size="md"
        class="mb-4 w-full text-xl font-semibold"
        @click="emit('add')"
      >
        ADD
      </BaseButton>
    </template>
    <template v-else>
      <BaseButton size="md" class="w-full text-xl font-semibold" @click="setOpenPopup('popup-connect')">
        <BaseIcon name="wallet" size="24" class="text-white" />
        <span class="uppercase">Connect Wallet</span>
      </BaseButton>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { Token } from '@monchain/swap-sdk-core'
  import { useAccount } from '@wagmi/vue'
  import Decimal from 'decimal.js'
  import type { TYPE_SWAP } from '~/types/swap.type'

  interface IProps {
    loading0?: boolean
    loading1?: boolean
    loadingAdd?: boolean
    balance0?: string
    balance1?: string
  }

  const props = withDefaults(defineProps<IProps>(), {
    loading0: false,
    loading1: false,
    loadingAdd: false,
    balance0: '0',
    balance1: '0'
  })

  const { tokenA, tokenB, depositADisabled, depositBDisabled } = useV3DerivedInfo()
  const { feeAmount, form, startPriceTypedValue, allowance0, allowance1, baseCurrency, quoteCurrency } = storeToRefs(useLiquidityStore())
  const { poolExits } = usePools()
  const { isConnected } = useAccount()

  const { setOpenPopup } = useBaseStore()

  const emit = defineEmits<{
    approve: [type: TYPE_SWAP]
    add: []
  }>()

  const route = useRoute()

  const isInvalidPair = computed(() => {
    return !tokenA.value || !tokenB.value || !feeAmount.value
  })

  const isInsufficientBalanceA = computed(() => {
    const amountA = form.value.amountDeposit0 || 0
    const balanceA = props.balance0 || 0
    return depositADisabled.value ? false : new Decimal(amountA).greaterThan(balanceA)
  })

  const isInsufficientBalanceB = computed(() => {
    const amountB = form.value.amountDeposit1 || 0
    const balanceB = props.balance1 || 0
    return depositBDisabled.value ? false : new Decimal(amountB).greaterThan(balanceB)
  })

  const titleInsufficientBalance = computed(() => {
    return isInsufficientBalanceA.value ? `Insufficient ${tokenA.value?.symbol} balance` : `Insufficient ${tokenB.value?.symbol} balance`
  })

  // const isValidAmountDeposit = computed(() => {
  //   return Number(form.value.amountDeposit0) > 0 && Number(form.value.amountDeposit1) > 0
  // })

  //  isInvalidPair = false, start current price = '', amount deposit A = '', amount deposit B = ''
  const isShowEnterAmount = computed(() => {
    const { amountDeposit0, amountDeposit1 } = form.value
    let missingAmounts = false
    if (depositADisabled.value && depositBDisabled.value) {
      missingAmounts = true
    } else if (depositADisabled.value && !depositBDisabled.value) {
      missingAmounts = !parseFloat(amountDeposit1)
    } else if (!depositADisabled.value && depositBDisabled.value) {
      missingAmounts = !parseFloat(amountDeposit0)
    } else {
      missingAmounts = !parseFloat(amountDeposit0) || !parseFloat(amountDeposit1)
    }
    if (route.name === 'liquidity-network-tokenId') {
      return missingAmounts
    } else {
      return poolExits.value ? missingAmounts : !isInvalidPair.value && (missingAmounts || !startPriceTypedValue.value)
    }
  })

  const title = computed(() => {
    return isShowEnterAmount.value ? 'Enter an amount' : titleInsufficientBalance.value
  })

  const isNeedAllowance0 = computed(() => {
    const allowance = new Decimal(allowance0.value?.toString() || '0').div(10 ** +form.value.token0.decimals)
    return depositADisabled.value ? false : allowance0.value === BigInt(0) || allowance.lessThan(form.value.amountDeposit0 || 0)
  })

  const isNeedAllowance1 = computed(() => {
    const allowance = new Decimal(allowance1.value?.toString() || '0').div(10 ** +form.value.token1.decimals)
    return depositBDisabled.value ? false : allowance1.value === BigInt(0) || allowance.lessThan(form.value.amountDeposit1 || 0)
  })

  const isShowBtnEnable0 = computed(() => {
    const condition =
      !isInvalidPair.value && !isShowEnterAmount.value && !isInsufficientBalanceA.value && !isInsufficientBalanceB.value && isNeedAllowance0.value
    return route.name === 'add-currency'
      ? baseCurrency.value?.isNative
        ? false
        : condition
      : unwrappedToken(baseCurrency.value as Token)?.isNative
        ? false
        : condition
  })

  const isShowBtnEnable1 = computed(() => {
    const condition =
      !isInvalidPair.value && !isShowEnterAmount.value && !isInsufficientBalanceA.value && !isInsufficientBalanceB.value && isNeedAllowance1.value
    return route.name === 'add-currency'
      ? quoteCurrency.value?.isNative
        ? false
        : condition
      : unwrappedToken(quoteCurrency.value as Token)?.isNative
        ? false
        : condition
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

  const isDisabledAdd = computed(() => {
    const { amountDeposit0, amountDeposit1 } = form.value
    let missingAmounts = false
    if (depositADisabled.value && depositBDisabled.value) {
      missingAmounts = true
    } else if (depositADisabled.value && !depositBDisabled.value) {
      missingAmounts = !amountDeposit1
    } else if (!depositADisabled.value && depositBDisabled.value) {
      missingAmounts = !amountDeposit0
    } else {
      missingAmounts = !amountDeposit0 || !amountDeposit1
    }
    if (route.name === 'liquidity-network-tokenId') {
      return missingAmounts
    }
    return missingAmounts || form.value.minPrice === '' || form.value.maxPrice === ''
  })
</script>

<style lang="scss"></style>
