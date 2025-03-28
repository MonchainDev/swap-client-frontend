<template>
  <ClientOnly>
    <div class="relative mx-auto mb-[74px] mt-[38px] max-w-[1024px] sm:mt-0 sm:px-4">
      <div class="flex items-center justify-between sm:hidden">
        <div class="flex items-center gap-4">
          <NuxtLink to="/liquidity/pool" class="flex size-10 items-center justify-center rounded-lg border border-solid border-gray-3 bg-white">
            <BaseIcon name="arrow-down" size="24" class="rotate-90" />
          </NuxtLink>
          <h4 class="text-xl font-semibold">Liquidity Pools & Farms / Add Liquidity</h4>
        </div>
      </div>
      <div class="relative z-10 mt-7 grid grid-cols-[513px_1fr] gap-1 sm:mt-0 sm:grid-cols-1">
        <BlockAddLiquidityLeft :is-token0-selected :is-token1-selected />
        <BlockAddLiquidityRight :is-token0-selected :is-token1-selected />
      </div>

      <div class="bg-linear-mb absolute left-0 top-0 hidden h-[100px] w-screen sm:block"></div>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
  import { FeeAmount } from '@monchain/v3-sdk'
  import { LIST_NETWORK } from '~/config/networks'

  definePageMeta({
    middleware: ['reset-form-liquidity-middleware', 'reset-all-popup-middleware', 'validate-network-middleware']
  })

  const { form, feeAmount, listTokenOfRange } = storeToRefs(useLiquidityStore())
  const { chainId } = useActiveChainId()

  const isToken0Selected = computed(() => form.value.token0.symbol !== '')
  const isToken1Selected = computed(() => form.value.token1.symbol !== '')

  const { params } = useRoute('add-currency')

  /** Fill currency in params to form */
  ;(async () => {
    let currencies: string[] = []
    if ('currency' in params) {
      currencies = params.currency as string[]
    }

    if (currencies && currencies.length) {
      const [currencyA, currencyB, feeAmountFromUrl] = currencies

      if (currencyA && currencyB) {
        const [tokenA, tokenB] = await Promise.all([getTokenByChainId(currencyA, chainId.value!), getTokenByChainId(currencyB, chainId.value!)])
        if (tokenA && tokenB) {
          form.value.token0 = {
            name: tokenA.name ?? '',
            symbol: tokenA.symbol,
            decimals: tokenA.decimals,
            icon_url: '',
            address: tokenA.address,
            id: Math.random(),
            tokenSymbol: tokenA.symbol,
            tokenAddress: tokenA.address,
            tokenDecimals: tokenA.decimals,
            network: LIST_NETWORK.find((item) => item.chainId === tokenA.chainId)?.network ?? '',
            chainId: tokenA.chainId,
            stable: false,
            crossChain: false
          }
          form.value.token1 = {
            name: tokenB.name ?? '',
            symbol: tokenB.symbol,
            decimals: tokenB.decimals,
            icon_url: '',
            address: tokenB.address,
            id: Math.random(),
            tokenSymbol: tokenB.symbol,
            tokenAddress: tokenB.address,
            tokenDecimals: tokenB.decimals,
            network: LIST_NETWORK.find((item) => item.chainId === tokenB.chainId)?.network ?? '',
            chainId: tokenB.chainId,
            stable: false,
            crossChain: false
          }
          listTokenOfRange.value = [form.value.token0, form.value.token1]
        }
      }
      if (feeAmountFromUrl) {
        const value = feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
        feeAmount.value = value ? parseFloat(feeAmountFromUrl) : 0
      }
    }
  })()
</script>

<style lang="scss"></style>
