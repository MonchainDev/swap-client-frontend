<template>
  <div class="rounded-bl-lg rounded-tl-lg bg-white pb-[57px] pl-8 pr-6 pt-[21px] shadow-sm">
    <div class="flex items-center justify-between">
      <h4 class="text-2xl font-semibold leading-7">Add Liquidity</h4>
      <ChooseNetwork />
    </div>
    <p class="mt-2 max-w-[386px] text-sm text-gray-8">Choose the tokens you want to provide liquidity for. You can select tokens on all supported networks.</p>
    <div class="mt-4 grid grid-cols-2 gap-4">
      <LiquiditySelectToken type="BASE" :is-selected="isToken0Selected" :token="form.token0" @select-token="openPopupSelectToken('BASE')" />
      <LiquiditySelectToken type="QUOTE" :is-selected="isToken1Selected" :token="form.token1" @select-token="openPopupSelectToken('QUOTE')" />
    </div>
    <div class="mt-8">
      <h4 class="text-lg font-semibold leading-7">Fee tier</h4>
      <div class="mt-4 grid grid-cols-[repeat(4,100px)] gap-5">
        <div
          v-for="item in LIST_FEE_AMOUNT"
          :key="item.value"
          class="cursor-pointer rounded-lg border border-solid border-gray-3 bg-[#fafafa] px-[13px] pb-[26px] pt-[15px]"
          @click="feeAmount = item.value"
        >
          <div class="flex items-center gap-[6px]">
            <BaseIcon v-show="feeAmount === item.value" name="radio-fill" size="24" />
            <BaseIcon v-show="feeAmount !== item.value" name="radio" size="24" />
            <span class="text-sm font-bold leading-5">{{ item.value / 10000 }}%</span>
          </div>
          <p class="mt-5 text-xs text-gray-8">{{ item.description }}</p>
        </div>
      </div>
    </div>
    <div class="mt-[34px]">
      <span class="text-lg font-semibold leading-7">Deposit Amount</span>
      <div class="mt-3 flex flex-col gap-4">
        <InputDepositLiquidity
          v-model:amount="form.amountDeposit0"
          :token="form.token0"
          type="BASE"
          :is-selected="isToken0Selected"
          :balance="balance0?.formatted"
          @change="handleChangeAmount"
        />
        <InputDepositLiquidity
          v-model:amount="form.amountDeposit1"
          :token="form.token1"
          type="QUOTE"
          :is-selected="isToken1Selected"
          :balance="balance1?.formatted"
          @change="handleChangeAmount"
        />
      </div>
    </div>
  </div>
  <PopupSelectToken @select="handleSelectToken" />
</template>

<script lang="ts" setup>
  import { useAccount, useBalance } from '@wagmi/vue'
  import { LIST_FEE_AMOUNT } from '~/constant'
  import type { IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'
  import useV3DerivedInfoComposable from '~/composables/useV3DerivedInfo'

  const { form, feeAmount, independentField, typedValue } = storeToRefs(useLiquidityStore())
  const { setOpenPopup } = useBaseStore()

  interface IProps {
    isToken0Selected: boolean
    isToken1Selected: boolean
  }

  const _props = withDefaults(defineProps<IProps>(), {
    isToken0Selected: false,
    isToken1Selected: false
  })

  const { independentAmount, dependentAmount, parsedAmounts } = useV3DerivedInfoComposable()

  watch(
    () => independentAmount.value,
    (value) => {
      if (value) {
        form.value.amountDeposit0 = parsedAmounts.value[CurrencyField.CURRENCY_A]?.toSignificant(5) || ''
      } else {
        form.value.amountDeposit0 = ''
      }
    }
  )

  watch(
    () => dependentAmount.value,
    (value) => {
      if (value) {
        if (independentField.value === CurrencyField.CURRENCY_A) {
          form.value.amountDeposit1 = parsedAmounts.value[CurrencyField.CURRENCY_B]?.toSignificant(5) || ''
        }
        if (independentField.value === CurrencyField.CURRENCY_B) {
          form.value.amountDeposit0 = parsedAmounts.value[CurrencyField.CURRENCY_A]?.toSignificant(5) || ''
        }
      } else {
        form.value.amountDeposit1 = ''
      }
    }
  )

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

  const { address } = useAccount()
  const { data: balance0 } = useBalance(
    computed(() => ({
      address: address.value,
      token: form.value.token0.address as MaybeRef<`0x${string}`>,
      watch: true
    }))
  )

  const { data: balance1 } = useBalance(
    computed(() => ({
      address: address.value,
      token: form.value.token1.address as MaybeRef<`0x${string}`>,
      watch: true
    }))
  )

  const handleChangeAmount = (value: string, type: TYPE_SWAP) => {
    if (type === 'BASE') {
      form.value.amountDeposit0 = value
    } else {
      form.value.amountDeposit1 = value
    }
    typedValue.value = value
    independentField.value = type === 'BASE' ? CurrencyField.CURRENCY_A : CurrencyField.CURRENCY_B
  }
</script>

<style lang="scss"></style>
