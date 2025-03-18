import { FeeAmount } from '@monchain/v3-sdk'

export default defineNuxtRouteMiddleware((to) => {
  let currencies: string[] = []
  if ('currency' in to.params) {
    currencies = to.params.currency as string[]
  }

  const { listToken } = storeToRefs(useBaseStore())
  const { form, feeAmount, listTokenOfRange } = storeToRefs(useLiquidityStore())

  if (currencies && currencies.length) {
    const [currencyA, currencyB, feeAmountFromUrl] = currencies
    if (currencyA && currencyB) {
      const tokenA = listToken.value.find(
        (item) => item.symbol.toLowerCase() === currencyA.toLowerCase() || item.address.toLocaleLowerCase() === currencyA.toLowerCase()
      )
      const tokenB = listToken.value.find(
        (item) => item.symbol.toLowerCase() === currencyB.toLowerCase() || item.address.toLocaleLowerCase() === currencyB.toLowerCase()
      )
      if (tokenA && tokenB) {
        form.value.token0 = tokenA
        form.value.token1 = tokenB
        listTokenOfRange.value = [tokenA, tokenB]
      }
    }
    if (feeAmountFromUrl) {
      const value = feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
      feeAmount.value = value ? parseFloat(feeAmountFromUrl) : 0
    }
  }
})
