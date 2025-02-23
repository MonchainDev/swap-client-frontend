<template>
  <div class="block-right rounded-br-lg rounded-tr-lg bg-white pl-8 pr-[22px] pt-[21px] shadow-sm">
    <div class="flex items-center gap-3">
      <span class="text-lg font-semibold leading-7">Set price range</span>
      <div class="flex cursor-pointer items-center gap-2" @click="handleChangeActiveRange('BASE')">
        <BaseIcon :name="activeRange === 'BASE' ? 'radio-fill' : 'radio'" size="24" />
        <span class="text-base">{{ form.token0.symbol }}</span>
      </div>

      <div class="flex cursor-pointer items-center gap-2" @click="handleChangeActiveRange('QUOTE')">
        <BaseIcon :name="activeRange === 'QUOTE' ? 'radio-fill' : 'radio'" size="24" />
        <span class="text-base">{{ form.token1.symbol }}</span>
      </div>
    </div>
    <ElInput v-model="startPriceTypedValue" placeholder="0.0" class="input-init-amount mt-5" />
    <p class="mt-2 flex justify-between text-sm">
      <span> Current {{ form.token0.symbol }} Price:</span>
      <!-- <span>{{ startPriceTypedValue ? startPriceTypedValue : '-' }} {{ form.token1.symbol }}</span> -->
      <span> {{ price ? (invertPrice ? price?.invert()?.toSignificant(5) : price?.toSignificant(5)) : '-' }} {{ form.token1.symbol }} </span>
    </p>
    <div class="mt-5">
      <!-- <img src="/demo-chart.png" alt="" /> -->
      <!-- <ChartPriceRange /> -->
    </div>
    <div class="mt-6 flex flex-col gap-5">
      <div class="grid grid-cols-2" :class="{ 'pointer-events-none opacity-50': isDisabledPriceRange }">
        <InputPriceRange
          v-model:amount="form.minPrice!"
          :active-range="activeRange"
          type="MIN"
          class="rounded-bl-lg rounded-tl-lg"
          @change="handleChangePriceRange('MIN')"
        />
        <InputPriceRange
          v-model:amount="form.maxPrice!"
          :active-range="activeRange"
          type="MAX"
          class="rounded-br-lg rounded-tr-lg border-l-0"
          @change="handleChangePriceRange('MIN')"
        />
      </div>
      <div class="grid grid-cols-4 gap-3" :class="{ 'pointer-events-none opacity-50': isDisabledPriceRange }">
        <div
          v-for="(item, key) in listSelectRange"
          :key="key"
          :class="{ 'bg-hyperlink text-white': rangeActive === key }"
          class="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-solid border-hyperlink text-sm font-semibold text-hyperlink"
          @click="handleClickRange(key, item)"
        >
          {{ key }}%
        </div>
        <div
          class="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-solid border-hyperlink text-sm font-semibold text-hyperlink"
          @click="handleClickRange(100)"
        >
          Full range
        </div>
      </div>
    </div>
    <BaseButton class="mt-[33px] w-full text-xl font-semibold">ENABLE {{ form.token1.symbol }}</BaseButton>
    <!-- <BaseButton class="mt-4 w-full text-xl font-semibold">ADD</BaseButton> -->
    <p>tickLower: {{ tickLower?.toString() }}</p>
    <p>tickUpper: {{ tickUpper?.toString() }}</p>
    <p>-----------------</p>
    <p>prices At Ticks min: {{ pricesAtTicks[Bound.LOWER]?.toSignificant(5) }}</p>
    <p>prices At Ticks max: {{ pricesAtTicks[Bound.UPPER]?.toSignificant(5) }}</p>
    <p>-----------------</p>
    <p>Token A: {{ tokenA.symbol }}</p>
    <p>Token B: {{ tokenB.symbol }}</p>
    <p>-----------------</p>
    <p>Token 0: {{ token0?.symbol }}</p>
    <p>Token 1: {{ token1?.symbol }}</p>
    <p>-----------------</p>
    <p>
      Invalid range: <span :class="{ 'text-error': invalidRange }"> {{ invalidRange }}</span>
    </p>
  </div>
</template>

<script lang="ts" setup>
  import { FeeAmount } from '@pancakeswap/v3-sdk'
  import useV3DerivedInfoComposable from '~/composables/useV3DerivedInfo'
  import { QUICK_ACTION_CONFIGS } from '~/constant'
  import { ZOOM_LEVELS } from '~/constant/zoom-level'
  import type { ZoomLevels } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'

  export type INPUT_PRICE = 'MIN' | 'MAX'
  interface IProps {
    isToken0Selected: boolean
    isToken1Selected: boolean
  }

  const _props = withDefaults(defineProps<IProps>(), {
    isToken0Selected: false,
    isToken1Selected: false
  })
  const activeRange = ref<TYPE_SWAP>('BASE')

  const { form, startPriceTypedValue, feeAmount, leftRangeTypedValue, rightRangeTypedValue } = storeToRefs(useLiquidityStore())
  const { switchTokens, dispatchRangeTypedValue } = useLiquidityStore()

  // const isSorted = computed(() => {
  //   return baseCurrency.value.wrapped && quoteCurrency.value.wrapped && baseCurrency.value.wrapped.sortsBefore(quoteCurrency.value.wrapped)
  // })

  const listSelectRange = computed(() => {
    return QUICK_ACTION_CONFIGS[feeAmount.value ?? FeeAmount.MEDIUM]
  })
  const rangeActive = ref<number | null>(null)

  const isDisabledPriceRange = computed(() => {
    return !startPriceTypedValue.value
  })

  const handleChangeActiveRange = (range: TYPE_SWAP) => {
    activeRange.value = range
    switchTokens()
  }

  const handleChangePriceRange = (type: INPUT_PRICE) => {
    if (type === 'MIN') {
      dispatchRangeTypedValue('MIN', +form.value.minPrice!)
    } else {
      dispatchRangeTypedValue('MAX', +form.value.maxPrice!)
    }
  }

  const {
    tickSpaceLimits,
    price,
    invertPrice,
    ticks,
    tokenA,
    tokenB,
    token0,
    token1,
    tickLower,
    parsedAmounts,
    tickUpper,
    lowerPrice,
    upperPrice,
    poolForPosition,
    pricesAtTicks,
    invalidRange
  } = useV3DerivedInfoComposable()

  setInterval(() => {
    console.log('🚀 ~ tickSpaceLimits:', tickSpaceLimits.value)
    console.log('🚀 ~ ticks:', ticks.value)
    console.log('🚀 ~ invertPrice:', invertPrice.value)
    console.log('🚀 ~ pricesAtTicks:', pricesAtTicks.value)
    console.log('🚀 ~ poolForPosition:', poolForPosition.value)
    console.log('🚀 ~ CURRENCY_A:', parsedAmounts.value[CurrencyField.CURRENCY_A]?.toSignificant(5))
    console.log('🚀 ~ CURRENCY_B:', parsedAmounts.value[CurrencyField.CURRENCY_B]?.toSignificant(5))
  }, 4000)
  watch(
    () => lowerPrice.value,
    (value) => {
      if (typeof leftRangeTypedValue.value === 'boolean') {
        form.value.minPrice = '0'
        form.value.maxPrice = '∞'
      } else {
        form.value.minPrice = value?.toSignificant(5)
      }
    }
  )
  watch(
    () => upperPrice.value,
    (value) => {
      if (typeof rightRangeTypedValue.value === 'boolean') {
        form.value.minPrice = '0'
        form.value.maxPrice = '∞'
      } else {
        form.value.maxPrice = value?.toSignificant(5)
      }
    }
  )

  const handleClickRange = (percent: number, zoomLevel?: ZoomLevels) => {
    if (percent === 100) {
      rangeActive.value = null
      dispatchRangeTypedValue('INFINITY')
    } else {
      rangeActive.value = percent === rangeActive.value ? null : percent
      let _zoomLevel: ZoomLevels = { ...zoomLevel! }
      if (!rangeActive.value) {
        _zoomLevel = ZOOM_LEVELS[FeeAmount.MEDIUM]
      }
      const currentPrice = price.value ? parseFloat((invertPrice.value ? price.value.invert() : price.value).toSignificant(8)) : undefined

      if (currentPrice) {
        dispatchRangeTypedValue('BOTH', currentPrice, _zoomLevel)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .block-right {
    :deep(.input-init-amount) {
      color: red;
      .el-input__wrapper {
        box-shadow: unset;
        background-color: transparent;
        padding-right: 0;
        border: 1px solid var(--color-gray-3);
        border-radius: 8px;

        .el-input__inner {
          height: 40px;
          font-size: 24px;
          font-weight: 600;
          overflow: hidden;
          color: var(--color-primary);
          &::placeholder {
            background: linear-gradient(91deg, #a8abb2 0%, #a8abb2 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
      }
    }
  }
</style>
