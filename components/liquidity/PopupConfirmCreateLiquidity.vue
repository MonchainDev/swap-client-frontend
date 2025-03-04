<template>
  <BasePopup name="popup-confirm-create-liquidity" width="540" title="Confirm adding liquidity" @open="handleOpen">
    <div class="flex items-center justify-between px-8">
      <div class="flex items-center gap-[10px]">
        <div class="flex">
          <img src="/token-default.png" alt="logo" class="size-7 rounded-full" />
          <img src="/token-default.png" alt="logo" class="-ml-4 size-7 rounded-full" />
        </div>
        <div class="text-base font-semibold">{{ currency0?.symbol }}-{{ currency1?.symbol }}</div>
      </div>
      <div class="flex h-9 w-[117px] items-center justify-center rounded-lg bg-[#E8FFEB] text-[#049C6B]">
        <BaseIcon name="tick" size="24" class="text-[#049C6B]" />
        <span>Active</span>
      </div>
    </div>
    <div class="mt-[30px] px-8">
      <div class="rounded-lg border border-solid border-gray-2 bg-gray-1 pb-[18px]">
        <div class="flex items-center justify-between gap-2 px-8 pt-4">
          <div class="flex items-center gap-[10px]">
            <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
            <div class="flex flex-col">
              <span class="text-base font-semibold">{{ currency0?.symbol }}</span>
              <span class="text-xs text-[#6F6A79]">{{ currency0?.name }}</span>
            </div>
          </div>
          <div class="flex flex-col text-right">
            <span class="text-[32px] font-semibold leading-none">{{ formattedValue0 }}</span>
            <span class="text-sm font-semibold text-gray-6">$0</span>
          </div>
        </div>
        <div class="ml-8 h-[30px] w-5 border-r-2 border-dashed border-gray-6" />
        <div class="flex items-center justify-between gap-2 px-8">
          <div class="flex items-center gap-[10px]">
            <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
            <div class="flex flex-col">
              <span class="text-base font-semibold">{{ currency1?.symbol }}</span>
              <span class="text-xs text-[#6F6A79]">{{ currency1?.name }}</span>
            </div>
          </div>
          <div class="flex flex-col text-right">
            <span class="text-[32px] font-semibold leading-none">{{ formattedValue1 }}</span>
            <span class="text-sm font-semibold text-gray-6">$0</span>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between border-t border-solid border-t-gray-3 px-8 pt-5">
          <span>Fee Tier</span>
          <span class="font-semibold">{{ fee }}%</span>
        </div>
      </div>
    </div>
    <div class="my-5 px-8">
      <div class="mt-1 flex items-center gap-3">
        <span class="text-lg font-semibold leading-7">View price range</span>
        <div class="flex cursor-pointer items-center gap-2" @click="handleClickViewPriceRange">
          <BaseIcon :name="sorted ? 'radio-fill' : 'radio'" size="24" />
          <span class="text-base">{{ currency0?.symbol }}</span>
        </div>

        <div class="flex cursor-pointer items-center gap-2" @click="handleClickViewPriceRange">
          <BaseIcon :name="!sorted ? 'radio-fill' : 'radio'" size="24" />
          <span class="text-base">{{ currency1?.symbol }}</span>
        </div>
      </div>
      <div class="mt-1 grid h-[186px] grid-cols-2 grid-rows-2 rounded-lg border border-solid border-gray-2 bg-gray-1">
        <div class="flex flex-col items-center justify-center border-r border-solid border-gray-2">
          <span class="text-sm font-semibold">Min price</span>
          <span class="text-[22px] font-semibold leading-7">{{ formattedPriceLower }}</span>
          <span class="text-xs text-gray-8">{{ subtitle }}</span>
        </div>
        <div class="flex flex-col items-center justify-center">
          <span class="text-sm font-semibold">Max price</span>
          <span class="text-[22px] font-semibold leading-7">{{ formattedPriceUpper }}</span>
          <span class="text-xs text-gray-8">{{ subtitle }}</span>
        </div>
        <div class="col-span-2 row-start-2 flex flex-col items-center justify-center divide-solid border-t border-gray-2">
          <span class="text-sm font-semibold">Current price</span>
          <span class="text-[22px] font-semibold leading-7">{{ formatPrice(price, 6, 'en-US') }}</span>
          <span class="text-xs text-gray-8">{{ subtitle }}</span>
        </div>
      </div>
      <BaseButton :loading="loadingAdd" size="md" class="mt-[33px] w-full text-xl font-semibold" @click="handleAddLiquidity"> Confirm </BaseButton>
    </div>
  </BasePopup>
</template>

<script lang="ts" setup>
  import type { Currency } from '@pancakeswap/swap-sdk-core'
  import type { Position } from '@pancakeswap/v3-sdk'
  import { Bound } from '~/types'

  interface IProps {
    position: Position | undefined
    baseCurrencyDefault: Currency | undefined
    ticksAtLimit: { [bound: string]: boolean | undefined }
  }

  const props = withDefaults(defineProps<IProps>(), {
    position: undefined,
    baseCurrencyDefault: undefined,
    ticksAtLimit: () => ({ [Bound.LOWER]: false, [Bound.UPPER]: false })
  })

  const loadingAdd = ref(false)

  const currency0 = computed(() => unwrappedToken(props.position?.pool.token0))
  const currency1 = computed(() => unwrappedToken(props.position?.pool.token1))

  const formattedValue0 = computed(() => {
    return formattedCurrencyAmount(props.position?.amount0, 6)
  })
  const formattedValue1 = computed(() => {
    return formattedCurrencyAmount(props.position?.amount1, 6)
  })

  const fee = computed(() => {
    return (Number(props.position?.pool.fee) || 0) / 10000
  })

  const baseCurrency = ref<Currency | undefined>(undefined)

  const sorted = computed(() => {
    return baseCurrency.value?.equals(currency0.value!)
  })
  const quoteCurrency = computed(() => (sorted.value ? currency1.value : currency0.value))

  const price = computed(() => {
    return sorted.value ? props.position?.pool.priceOf(props.position?.pool.token0) : props.position?.pool.priceOf(props.position.pool.token1)
  })

  const priceLower = computed(() => {
    return sorted.value ? props.position?.token0PriceLower : props.position?.token0PriceUpper.invert()
  })

  const priceUpper = computed(() => {
    return sorted.value ? props.position?.token0PriceUpper : props.position?.token0PriceLower.invert()
  })

  const formattedPriceLower = computed(() => {
    return formatTickPrice(priceLower.value, props.ticksAtLimit, Bound.LOWER, 'en-US')
  })
  const formattedPriceUpper = computed(() => {
    return formatTickPrice(priceUpper.value, props.ticksAtLimit, Bound.UPPER, 'en-US')
  })

  const subtitle = computed(() => {
    return `${quoteCurrency.value?.symbol} per ${baseCurrency.value?.symbol}`
  })

  const handleOpen = () => {
    baseCurrency.value = props.baseCurrencyDefault === currency0.value ? currency0.value : currency1.value
    console.log('🚀 ~ baseCurrency default:', baseCurrency.value?.equals(currency0.value!))
  }

  const handleClickViewPriceRange = () => {
    baseCurrency.value = useCloneDeep(quoteCurrency.value)
  }

  const handleAddLiquidity = async () => {
    //
  }
</script>

<style lang="scss"></style>
