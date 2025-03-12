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
    <ListFee :is-token0-selected="isToken0Selected" :is-token1-selected="isToken1Selected" />
    <div class="mt-[34px]">
      <span class="text-lg font-semibold leading-7">Deposit Amount</span>
      <div class="mt-3 flex flex-col gap-4">
        <InputDepositLiquidity
          v-model:amount="form.amountDeposit0"
          :token="form.token0"
          type="BASE"
          :is-selected="isToken0Selected"
          :balance="balance0?.formatted"
          :locked="depositADisabled"
          @change="handleChangeAmount"
          @select-percent="handleSelectPercent"
        />
        <InputDepositLiquidity
          v-model:amount="form.amountDeposit1"
          :token="form.token1"
          type="QUOTE"
          :is-selected="isToken1Selected"
          :balance="balance1?.formatted"
          :locked="depositBDisabled"
          @change="handleChangeAmount"
          @select-percent="handleSelectPercent"
        />
      </div>
    </div>
  </div>
  <PopupSelectToken @select="handleSelectToken" />
</template>

<script lang="ts" setup>
  import type { Token } from '@monchain/swap-sdk-core'
  import Decimal from 'decimal.js'
  import { WMON } from '~/constant/token'
  import { CurrencyField, type IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'

  const { form, independentField, typedValue, balance0, balance1, listTokenOfRange, baseCurrency, quoteCurrency } = storeToRefs(useLiquidityStore())
  const { resetFiled } = useLiquidityStore()
  const { setOpenPopup } = useBaseStore()
  const { currentNetwork } = storeToRefs(useBaseStore())

  interface IProps {
    isToken0Selected: boolean
    isToken1Selected: boolean
  }

  const _props = withDefaults(defineProps<IProps>(), {
    isToken0Selected: false,
    isToken1Selected: false
  })

  const { dependentAmount, formattedAmounts, depositADisabled, depositBDisabled } = useV3DerivedInfo()

  // watch(
  //   () => independentAmount.value,
  //   (value) => {
  //     if (value) {
  //       form.value.amountDeposit0 = parsedAmounts.value[CurrencyField.CURRENCY_A]?.toSignificant(20) ?? ''
  //     } else {
  //       form.value.amountDeposit0 = ''
  //     }
  //   }
  // )

  /**
   * This watcher is used to update the dependent amount when the independent amount changes
   * IMPORTANT: It also use in component PopupAddLiquidity
   * Refactor it in the future if i have time :D
   */
  watch(
    () => dependentAmount.value,
    (value) => {
      if (value && typedValue.value) {
        form.value.amountDeposit0 = formattedAmounts.value[CurrencyField.CURRENCY_A]
        form.value.amountDeposit1 = formattedAmounts.value[CurrencyField.CURRENCY_B]
      } else {
        form.value.amountDeposit0 = formattedAmounts.value[CurrencyField.CURRENCY_A] ?? ''
        form.value.amountDeposit1 = formattedAmounts.value[CurrencyField.CURRENCY_B] ?? ''
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

    const empty: IToken = { name: '', symbol: '', decimals: 0, icon_url: '', address: '' }

    const isNative = token.address === ''
    const wrapNative = WMON[currentNetwork.value.chainId as keyof typeof WMON]
    const isWrapNative = token.address === wrapNative.address

    const isWrappedNativeMatch = (currency: Native | Token | undefined, isNativeCheck: boolean, isWrapNativeCheck: boolean) => {
      return (isNativeCheck && currency?.wrapped?.address === wrapNative.address) || (isWrapNativeCheck && currency?.isNative)
    }

    if (isWrappedNativeMatch(isBase ? quoteCurrency.value : baseCurrency.value, isNative, isWrapNative)) {
      form.value.token0 = token
      form.value.token1 = empty
      return
    }

    const [primary, secondary]: ['token0' | 'token1', 'token0' | 'token1'] = isBase ? ['token0', 'token1'] : ['token1', 'token0']

    form.value[primary] = token
    form.value[secondary] = token.address === form.value[secondary].address ? empty : form.value[secondary]

    listTokenOfRange.value = [form.value.token0, form.value.token1]

    // reset form to 0 after select token
    resetFiled()
  }

  const handleChangeAmount = (value: string, type: TYPE_SWAP) => {
    const _value = !value || !Number(value) ? '' : value
    if (type === 'BASE') {
      form.value.amountDeposit0 = _value
    } else {
      form.value.amountDeposit1 = _value
    }
    typedValue.value = _value
    independentField.value = type === 'BASE' ? CurrencyField.CURRENCY_A : CurrencyField.CURRENCY_B
  }

  const handleSelectPercent = (index: number, type: TYPE_SWAP) => {
    const percent = [1, 0.25, 0.5, 0.75][index]
    const balance = type === 'BASE' ? balance0.value?.formatted : balance1.value?.formatted
    if (balance) {
      const result = new Decimal(balance).mul(percent).toSignificantDigits(6, Decimal.ROUND_DOWN).toString()
      handleChangeAmount(result, type)
    }
  }
</script>

<style lang="scss"></style>
