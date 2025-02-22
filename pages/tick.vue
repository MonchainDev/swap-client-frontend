<template>
  <div></div>
</template>

<script lang="ts" setup>
  import { ERC20Token } from '@pancakeswap/sdk'
  import { FeeAmount } from '@pancakeswap/v3-sdk'
  import { ZOOM_LEVELS } from '~/constant/zoom-level'
  import useV3DerivedInfo, { CurrencyField } from '~/utils/useV3DerivedInfo'

  const currentPrice = 100000
  const typedValue = '12'

  const baseCurrency = Native.onChain(16789)
  const currencyB = new ERC20Token(16789, '0x2E151A5CA0ea0373e983Fa9EB28eC98c058C8f34', 18, 'DAVE', 'DAVE Token')

  // const baseCurrency = Native.onChain(97)
  // const currencyB = new ERC20Token(97, '0xb0c4fb5ccb7aF4CaB4dDB52463c03249dfBD3e6e', 18, 'TRUMPX', 'TrumpX')

  const quoteCurrency = baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped) ? undefined : currencyB
  console.log('🚀 ~ baseCurrency:', baseCurrency)
  console.log('🚀 ~ quoteCurrency:', quoteCurrency)

  // min and max price
  const leftTypedValue = tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, (currentPrice! * ZOOM_LEVELS[FeeAmount.MEDIUM].initialMin).toString())
  const rightTypedValue = tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, (currentPrice! * ZOOM_LEVELS[FeeAmount.MEDIUM].initialMax).toString())

  const { pricesAtTicks, parsedAmounts, ticks } = useV3DerivedInfo(
    baseCurrency,
    quoteCurrency,
    FeeAmount.MEDIUM,
    baseCurrency,
    leftTypedValue,
    rightTypedValue,
    CurrencyField.CURRENCY_A,
    typedValue,
    '100000'
  )
  console.log('🚀 ~ ticks:', ticks)
  const { LOWER: priceLower, UPPER: priceUpper } = pricesAtTicks
  console.log(FeeAmount.MEDIUM)

  console.log('🚀 ~ min price', priceUpper?.toSignificant(5))
  console.log('🚀 ~ max price:', priceLower?.toSignificant(5))

  const formattedAmounts = {
    [CurrencyField.CURRENCY_A]: typedValue,
    [CurrencyField.CURRENCY_B]: parsedAmounts[CurrencyField.CURRENCY_B]?.toSignificant(6) ?? ''
  }

  console.log(`🚀 ~ ${typedValue} ${baseCurrency.symbol}  = ${formattedAmounts[CurrencyField.CURRENCY_B]} ${quoteCurrency?.symbol}`)
  // console.log('🚀 ~ price:', price?.toSignificant(6))
  // console.log('🚀 ~ price invert:', price?.invert().toSignificant(6))
</script>

<style lang="scss"></style>
