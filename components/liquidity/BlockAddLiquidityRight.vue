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
    <ElInput v-model="startPriceTypedValue" :disabled="disabledInputCurrentPrice" placeholder="0.0" class="input-init-amount mt-5" />
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
          @blur="handleChangePriceRange"
          @increase="handleIncreasePriceRange('MIN')"
          @decrease="handleDecreasePriceRange('MIN')"
        />
        <InputPriceRange
          v-model:amount="form.maxPrice!"
          :active-range="activeRange"
          type="MAX"
          class="rounded-br-lg rounded-tr-lg border-l-0"
          @blur="handleChangePriceRange"
          @increase="handleIncreasePriceRange('MAX')"
          @decrease="handleDecreasePriceRange('MAX')"
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
    <div v-if="outOfRange || invalidRange" class="mt-5 flex items-center gap-3 rounded-lg border border-solid border-warning bg-[#FFB23719] p-4">
      <BaseIcon name="warning" size="24" class="text-warning" />
      <span class="text-xs text-warning">
        <template v-if="outOfRange"> Your position will not earn fees or be used in trades until the market price moves into your range.' </template>
        <template v-if="invalidRange"> Invalid range selected. The min price must be lower than the max price. </template>
      </span>
    </div>
    <BaseButton class="mt-[33px] w-full text-xl font-semibold">ENABLE {{ form.token1.symbol }}</BaseButton>
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

  const { form, startPriceTypedValue, feeAmount, leftRangeTypedValue, rightRangeTypedValue, baseCurrency, quoteCurrency } = storeToRefs(useLiquidityStore())
  const { switchTokens, dispatchRangeTypedValue } = useLiquidityStore()

  const disabledInputCurrentPrice = computed(() => {
    return !baseCurrency.value || !quoteCurrency.value
  })

  const isSorted = computed(() => {
    return tokenA.value && tokenB.value && tokenA.value.sortsBefore(tokenB.value)
  })

  const listSelectRange = computed(() => {
    return QUICK_ACTION_CONFIGS[feeAmount.value ?? FeeAmount.MEDIUM]
  })
  const rangeActive = ref<number | null>(null)

  const isDisabledPriceRange = computed(() => {
    return !startPriceTypedValue.value
  })

  const handleChangePriceRange = (type: INPUT_PRICE) => {
    if (type === 'MIN') {
      dispatchRangeTypedValue('MIN', +form.value.minPrice!)
    } else {
      dispatchRangeTypedValue('MAX', +form.value.maxPrice!)
    }
  }

  const { price, invertPrice, tokenA, tokenB, lowerPrice, upperPrice, invalidRange, outOfRange } = useV3DerivedInfoComposable()

  watch(
    () => lowerPrice.value,
    (value) => {
      if (typeof leftRangeTypedValue.value === 'boolean') {
        form.value.minPrice = '0'
        form.value.maxPrice = '∞'
      } else {
        console.log('🚀 ~ value lowerPrice change:', isSorted.value ? value?.toSignificant(5) : upperPrice.value?.invert().toSignificant(5))
        form.value.minPrice = isSorted.value ? value?.toSignificant(5) : upperPrice.value?.invert().toSignificant(5)
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
        console.log('🚀 ~ value upperPrice change:', isSorted.value ? value?.toSignificant(5) : lowerPrice.value?.invert().toSignificant(5))
        form.value.maxPrice = isSorted.value ? value?.toSignificant(5) : lowerPrice.value?.invert().toSignificant(5)
      }
    }
  )

  const handleChangeActiveRange = (range: TYPE_SWAP) => {
    activeRange.value = range
    switchTokens()
    rangeActive.value = null
  }

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

  const { getDecrementLower, getDecrementUpper, getIncrementLower, getIncrementUpper } = useRangeHopCallbacks()
  const handleIncreasePriceRange = (type: INPUT_PRICE) => {
    if (type === 'MIN') {
      const value = isSorted.value ? getIncrementLower() : getDecrementUpper()
      leftRangeTypedValue.value = value
    } else {
      const value = isSorted.value ? getIncrementUpper() : getDecrementLower()
      rightRangeTypedValue.value = value
    }
    rangeActive.value = null
  }
  const handleDecreasePriceRange = (_type: INPUT_PRICE) => {
    if (_type === 'MIN') {
      const value = isSorted.value ? getDecrementLower() : getIncrementUpper()
      leftRangeTypedValue.value = value
    } else {
      const value = isSorted.value ? getDecrementUpper() : getIncrementLower()
      rightRangeTypedValue.value = value
    }
    rangeActive.value = null
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
