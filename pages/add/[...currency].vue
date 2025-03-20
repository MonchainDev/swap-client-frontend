<template>
  <ClientOnly>
    <div class="mx-auto mb-[74px] mt-[38px] max-w-[1024px]">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/liquidity/pool" class="flex size-10 items-center justify-center rounded-lg border border-solid border-gray-3 bg-white">
            <BaseIcon name="arrow-down" size="24" class="rotate-90" />
          </NuxtLink>
          <h4 class="text-xl font-semibold">Liquidity Pools & Farms / Add Liquidity</h4>
        </div>
      </div>
      <div class="mt-7 grid grid-cols-[513px_1fr] gap-1">
        <BlockAddLiquidityLeft :is-token0-selected :is-token1-selected />
        <BlockAddLiquidityRight :is-token0-selected :is-token1-selected />
      </div>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
  import { FeeAmount } from '@monchain/v3-sdk'

  definePageMeta({
    middleware: ['reset-form-liquidity-middleware', 'reset-all-popup-middleware', 'validate-network-middleware']
  })

  const { listToken } = storeToRefs(useBaseStore())
  const { form, feeAmount, listTokenOfRange } = storeToRefs(useLiquidityStore())

  const isToken0Selected = computed(() => form.value.token0.symbol !== '')
  const isToken1Selected = computed(() => form.value.token1.symbol !== '')

  const { params } = useRoute('add-currency')

  watchEffect(() => {
    let currencies: string[] = []
    if ('currency' in params) {
      currencies = params.currency as string[]
    }

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
</script>

<style lang="scss"></style>
