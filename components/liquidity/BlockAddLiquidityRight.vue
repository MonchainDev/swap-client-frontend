<template>
  <div class="block-right rounded-br-lg rounded-tr-lg bg-white pl-8 pr-[22px] pt-[21px] shadow-sm">
    <div class="flex items-center gap-3">
      <span class="text-lg font-semibold leading-7">Set price range</span>
      <div v-if="props.isToken0Selected" class="flex cursor-pointer items-center gap-2" @click="handleChangeActiveRange('BASE')">
        <BaseIcon :name="activeRange === 'BASE' ? 'radio-fill' : 'radio'" size="24" />
        <span class="text-base">{{ form.token0.symbol }}</span>
      </div>

      <div v-if="props.isToken1Selected" class="flex cursor-pointer items-center gap-2" @click="handleChangeActiveRange('QUOTE')">
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
      <ListSelectRange @select="handleClickRange" />
    </div>
    <div v-if="outOfRange || invalidRange" class="mt-5 flex items-center gap-3 rounded-lg border border-solid border-warning bg-[#FFB23719] p-4">
      <BaseIcon name="warning" size="24" class="text-warning" />
      <span class="text-xs text-warning">
        <template v-if="outOfRange"> Your position will not earn fees or be used in trades until the market price moves into your range.' </template>
        <template v-if="invalidRange"> Invalid range selected. The min price must be lower than the max price. </template>
      </span>
    </div>
    <GroupButtonLiquidity :loading0="loadingApprove0" :loading1="loadingApprove1" @approve="handleApprove" />
  </div>
</template>

<script lang="ts" setup>
  import { FeeAmount } from '@pancakeswap/v3-sdk'
  import { CONTRACT_ADDRESS, MAX_NUMBER_APPROVE } from '~/constant/contract'
  import { ZOOM_LEVELS } from '~/constant/zoom-level'
  import type { ZoomLevels } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'

  export type INPUT_PRICE = 'MIN' | 'MAX'
  interface IProps {
    isToken0Selected: boolean
    isToken1Selected: boolean
  }

  const props = withDefaults(defineProps<IProps>(), {
    isToken0Selected: false,
    isToken1Selected: false
  })
  const activeRange = ref<TYPE_SWAP>('BASE')
  const loadingApprove0 = ref(false)
  const loadingApprove1 = ref(false)

  const { form, startPriceTypedValue, feeAmount, buttonRangePercent, leftRangeTypedValue, rightRangeTypedValue, baseCurrency, quoteCurrency } =
    storeToRefs(useLiquidityStore())
  const { switchTokens, dispatchRangeTypedValue, refetchAllowance0, refetchAllowance1 } = useLiquidityStore()

  const disabledInputCurrentPrice = computed(() => {
    return !baseCurrency.value || !quoteCurrency.value || !feeAmount.value
  })

  const isSorted = computed(() => {
    return tokenA.value && tokenB.value && tokenA.value.sortsBefore(tokenB.value)
  })

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

  const { price, invertPrice, tokenA, tokenB, lowerPrice, upperPrice, invalidRange, outOfRange } = useV3DerivedInfo()

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
    if (range === activeRange.value) return
    activeRange.value = range
    switchTokens()
    buttonRangePercent.value = null
  }

  const handleClickRange = (percent: number, zoomLevel?: ZoomLevels) => {
    if (percent === 100) {
      buttonRangePercent.value = null
      dispatchRangeTypedValue('INFINITY')
    } else {
      buttonRangePercent.value = percent === buttonRangePercent.value ? null : percent
      let _zoomLevel: ZoomLevels = { ...zoomLevel! }
      if (!buttonRangePercent.value) {
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
    buttonRangePercent.value = null
  }
  const handleDecreasePriceRange = (_type: INPUT_PRICE) => {
    if (_type === 'MIN') {
      const value = isSorted.value ? getDecrementLower() : getIncrementUpper()
      leftRangeTypedValue.value = value
    } else {
      const value = isSorted.value ? getDecrementUpper() : getIncrementLower()
      rightRangeTypedValue.value = value
    }
    buttonRangePercent.value = null
  }

  const { approveToken } = useApproveToken()

  const handleApprove = async (type: TYPE_SWAP) => {
    if (type === 'BASE') {
      loadingApprove0.value = true
      await approveToken(tokenA.value?.address as string, CONTRACT_ADDRESS.NONFUNGIBLE_POSITION_MANAGER, MAX_NUMBER_APPROVE, () => {
        refetchAllowance0()
        loadingApprove0.value = false
      })
    } else {
      loadingApprove1.value = true
      await approveToken(tokenB.value?.address as string, CONTRACT_ADDRESS.NONFUNGIBLE_POSITION_MANAGER, MAX_NUMBER_APPROVE, () => {
        refetchAllowance1()
        loadingApprove1.value = false
      })
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
