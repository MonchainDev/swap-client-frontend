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
    <ListFee />
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
  import { CurrencyField, type IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'

  const { form, independentField, typedValue, balance0, balance1, listTokenOfRange } = storeToRefs(useLiquidityStore())
  const { resetFiled } = useLiquidityStore()
  const { setOpenPopup } = useBaseStore()

  interface IProps {
    isToken0Selected: boolean
    isToken1Selected: boolean
  }

  const _props = withDefaults(defineProps<IProps>(), {
    isToken0Selected: false,
    isToken1Selected: false
  })

  const { independentAmount, dependentAmount, parsedAmounts } = useV3DerivedInfo()

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
    const isBase = typeCurrent.value === 'BASE'
    const [primary, secondary]: ['token0' | 'token1', 'token0' | 'token1'] = isBase ? ['token0', 'token1'] : ['token1', 'token0']

    form.value[primary] = token
    form.value[secondary] =
      token.address === form.value[secondary].address ? { name: '', symbol: '', decimals: 0, icon_url: '', address: '' } : form.value[secondary]

    listTokenOfRange.value[isBase ? 0 : 1] = token
    if (form.value[secondary].address) {
      listTokenOfRange.value[isBase ? 1 : 0] = form.value[secondary]
    }
    // reset form to 0 after select token
    resetFiled()
  }

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
