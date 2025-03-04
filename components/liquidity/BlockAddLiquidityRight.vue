<template>
  <div class="block-right rounded-br-lg rounded-tr-lg bg-white pl-8 pr-[22px] pt-[21px] shadow-sm">
    <div v-if="!poolExits" class="flex flex-col gap-4">
      <span class="text-lg font-semibold leading-7">Set starting price</span>
      <div class="flex gap-3 rounded-lg border border-solid border-warning p-6 pl-[18px]">
        <BaseIcon name="info-warning" size="24" class="text-warning" />
        <div class="flex flex-col gap-4 text-sm leading-5 text-warning">
          <p>
            This pool must be initialized before you can add liquidity. To initialize, select a starting price for the pool. Then, enter your liquidity price
            range and deposit amount. Gas fees will be higher than usual due to the initialization transaction.
          </p>
          <p class="font-bold">Fee-on transfer tokens and rebasing tokens are NOT compatible with V3.</p>
        </div>
      </div>
      <ElInput
        v-model="startPriceTypedValue"
        :formatter="(value: string) => formatNumberInput(value)"
        :parser="(value: string) => parseNumberInput(value)"
        :disabled="disabledInputCurrentPrice"
        placeholder="0.0"
        class="input-init-amount"
        @blur="handleBlurStartValue"
      />
      <p v-if="form.token0.symbol && form.token1.symbol" class="flex justify-between text-sm">
        <span> Current {{ form.token0.symbol }} Price:</span>
        <!-- <span>{{ startPriceTypedValue ? startPriceTypedValue : '-' }} {{ form.token1.symbol }}</span> -->
        <span> {{ price ? (invertPrice ? price?.invert()?.toSignificant(5) : price?.toSignificant(5)) : '-' }} {{ form.token1.symbol }} </span>
      </p>
    </div>
    <div class="mt-7 flex items-center gap-3" :class="{ '!mt-0': poolExits }">
      <span class="text-lg font-semibold leading-7">Set price range</span>
      <template v-if="props.isToken0Selected && props.isToken1Selected">
        <div class="flex cursor-pointer items-center gap-2" @click="handleChangeActiveRange">
          <BaseIcon :name="listTokenOfRange[0].address === form.token0.address ? 'radio-fill' : 'radio'" size="24" />
          <span class="text-base">{{ listTokenOfRange[0].symbol }}</span>
        </div>

        <div class="flex cursor-pointer items-center gap-2" @click="handleChangeActiveRange">
          <BaseIcon :name="listTokenOfRange[1].address === form.token0.address ? 'radio-fill' : 'radio'" size="24" />
          <span class="text-base">{{ listTokenOfRange[1].symbol }}</span>
        </div>
      </template>
    </div>
    <p v-if="poolExits" class="mt-2 flex justify-between text-sm">
      <span> Current {{ form.token0.symbol }} Price:</span>
      <span> {{ price ? (invertPrice ? price?.invert()?.toSignificant(5) : price?.toSignificant(5)) : '-' }} {{ form.token1.symbol }} </span>
    </p>
    <!-- 
    <div class="mt-5">
      <img src="/demo-chart.png" alt="" />
      <ChartPriceRange />
    </div> -->
    <div class="mt-4 flex flex-col gap-5">
      <div class="grid grid-cols-2" :class="{ 'pointer-events-none opacity-50': isDisabledPriceRange }">
        <InputPriceRange
          v-model:amount="form.minPrice!"
          type="MIN"
          class="rounded-bl-lg rounded-tl-lg"
          @blur="handleChangePriceRange"
          @increase="handleIncreasePriceRange('MIN')"
          @decrease="handleDecreasePriceRange('MIN')"
        />
        <InputPriceRange
          v-model:amount="form.maxPrice!"
          type="MAX"
          class="rounded-br-lg rounded-tr-lg border-l-0"
          @blur="handleChangePriceRange"
          @increase="handleIncreasePriceRange('MAX')"
          @decrease="handleDecreasePriceRange('MAX')"
        />
      </div>
      <ListSelectRange :class="{ 'pointer-events-none opacity-50': isDisabledPriceRange }" @select="handleClickRange" />
    </div>
    <div v-if="outOfRange || invalidRange" class="mt-5 flex items-center gap-3 rounded-lg border border-solid border-warning bg-[#FFB23719] p-4">
      <BaseIcon name="warning" size="24" class="text-warning" />
      <span class="text-xs text-warning">
        <template v-if="outOfRange"> Your position will not earn fees or be used in trades until the market price moves into your range.</template>
        <template v-if="invalidRange"> Invalid range selected. The min price must be lower than the max price. </template>
      </span>
    </div>
    <GroupButtonLiquidity :loading-add="loadingAdd" :loading0="loadingApprove0" :loading1="loadingApprove1" @approve="handleApprove" @add="handleCreatePool" />
  </div>
  <PopupAddLiquidity
    :currency-base="baseCurrency"
    :currency-quote="quoteCurrency"
    :position="position"
    :value-lower="form.amountDeposit0"
    :value-upper="form.amountDeposit1"
    :fee-format="formatFee"
    :show-input="false"
  />
  <PopupConfirmCreateLiquidity :position :base-currency-default="baseCurrency" :ticks-at-limit="ticksAtLimit" />
</template>

<script lang="ts" setup>
  import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import { CONTRACT_ADDRESS, MAX_NUMBER_APPROVE } from '~/constant/contract'
  import { ZOOM_LEVELS } from '~/constant/zoom-level'
  import { Bound, CurrencyField, type ZoomLevels } from '~/types'

  import { Percent } from '@pancakeswap/swap-sdk-core'
  import { useAccount } from '@wagmi/vue'
  import { hexToBigInt } from 'viem'
  import { config } from '~/config/wagmi'
  import { BIPS_BASE } from '~/constant'
  import { FeeAmount } from '~/constant/fee'
  import type { TYPE_SWAP } from '~/types/swap.type'
  import { NonfungiblePositionManager } from '~/utils/nonfungiblePositionManager'

  export type INPUT_PRICE = 'MIN' | 'MAX'
  interface IProps {
    isToken0Selected: boolean
    isToken1Selected: boolean
  }

  const props = withDefaults(defineProps<IProps>(), {
    isToken0Selected: false,
    isToken1Selected: false
  })

  const { setOpenPopup } = useBaseStore()

  const loadingApprove0 = ref(false)
  const loadingApprove1 = ref(false)
  const loadingAdd = ref(false)

  const { poolExits } = usePools()

  const {
    form,
    startPriceTypedValue,
    feeAmount,
    listTokenOfRange,
    buttonRangePercent,
    leftRangeTypedValue,
    rightRangeTypedValue,
    baseCurrency,
    quoteCurrency,
    independentField,
    typedValue
  } = storeToRefs(useLiquidityStore())
  const { switchTokens, dispatchRangeTypedValue, refetchAllowance0, refetchAllowance1, resetFiled, refetchBalance0, refetchBalance1 } = useLiquidityStore()

  watch(
    () => startPriceTypedValue.value,
    () => {
      buttonRangePercent.value = null
    }
  )

  const disabledInputCurrentPrice = computed(() => {
    return !baseCurrency.value || !quoteCurrency.value || !feeAmount.value
  })

  const formatFee = computed(() => {
    return feeAmount.value ? `${feeAmount.value / 10000}%` : ''
  })

  const isSorted = computed(() => {
    return tokenA.value && tokenB.value && tokenA.value.sortsBefore(tokenB.value)
  })

  const isDisabledPriceRange = computed(() => {
    return !startPriceTypedValue.value && !poolExits.value
  })

  const handleChangePriceRange = (type: INPUT_PRICE) => {
    if (type === 'MIN') {
      dispatchRangeTypedValue('MIN', +form.value.minPrice!)
    } else {
      dispatchRangeTypedValue('MAX', +form.value.maxPrice!)
    }
    buttonRangePercent.value = null
  }

  const { price, invertPrice, tokenA, position, ticksAtLimit, formattedAmounts, tokenB, lowerPrice, upperPrice, invalidRange, outOfRange, noLiquidity } =
    useV3DerivedInfo()

  watch(
    () => lowerPrice.value,
    (value) => {
      if (typeof leftRangeTypedValue.value === 'boolean') {
        // case neu xoa het gia tri min va max, sau khi nhap max price se set gia tri min price = ''
        // min price = 0  khi set full range
        form.value.minPrice = form.value.minPrice === '' ? '' : '0'
      } else {
        if (lowerPrice.value) {
          form.value.minPrice = isSorted.value ? value?.toSignificant(5) : upperPrice.value?.invert().toSignificant(5)
          // console.log('🚀 ~ value lowerPrice change:', form.value.minPrice)
        } else {
          form.value.minPrice = ''
        }
      }
    }
  )
  watch(
    () => upperPrice.value,
    (value) => {
      if (typeof rightRangeTypedValue.value === 'boolean') {
        form.value.maxPrice = form.value.maxPrice === '' || form.value.maxPrice === '0' ? form.value.maxPrice : '∞'
      } else {
        if (upperPrice.value) {
          form.value.maxPrice = isSorted.value ? value?.toSignificant(5) : lowerPrice.value?.invert().toSignificant(5)
          // console.log('🚀 ~ value upperPrice change:', form.value.maxPrice)
        } else {
          form.value.maxPrice = ''
        }
      }
    }
  )

  const handleChangeActiveRange = () => {
    buttonRangePercent.value = null

    // console.log('before currencies', currencies.value)
    // console.log('before', formattedAmounts.value)

    // console.log('after change independentField', formattedAmounts.value)
    // console.log('🚀 ~ after change ~ typedValue:', typedValue.value)

    if (poolExits.value) {
      typedValue.value = formattedAmounts.value[CurrencyField.CURRENCY_B]
      independentField.value = CurrencyField.CURRENCY_A
    } else {
      form.value.amountDeposit0 = ''
      form.value.amountDeposit1 = ''
      typedValue.value = CurrencyField.CURRENCY_A
    }

    if (!ticksAtLimit.value[Bound.LOWER] && !ticksAtLimit.value[Bound.UPPER]) {
      /**
       * CASE: Khi chon set price range
       * Vi sau khi leftRangeTypedValue duoc gan 1 gia tri moi, thi upperPrice.value se bi thay doi
       * nen can clone gia tri upperPrice.value va lowerPrice.value de su dung
       */

      const cloneUpperPrice = upperPrice.value
      const cloneLowerPrice = lowerPrice.value
      leftRangeTypedValue.value = (invertPrice.value ? lowerPrice.value : upperPrice.value?.invert()) ?? undefined
      rightRangeTypedValue.value = (invertPrice.value ? cloneUpperPrice : cloneLowerPrice?.invert()) ?? undefined
    }

    switchTokens()
    // console.log('currencies', currencies.value)
    // console.log('after', formattedAmounts.value)
  }

  const handleClickRange = (percent: number, zoomLevel?: ZoomLevels) => {
    const currentPrice = price.value ? parseFloat((invertPrice.value ? price.value.invert() : price.value).toSignificant(8)) : undefined

    if (percent === 100) {
      if (buttonRangePercent.value === 100) {
        buttonRangePercent.value = null
        dispatchRangeTypedValue('BOTH', currentPrice, ZOOM_LEVELS[FeeAmount.MEDIUM])
      } else {
        buttonRangePercent.value = 100
        dispatchRangeTypedValue('INFINITY')
      }
    } else {
      buttonRangePercent.value = percent === buttonRangePercent.value ? null : percent
      let _zoomLevel: ZoomLevels = { ...zoomLevel! }
      if (!buttonRangePercent.value) {
        _zoomLevel = ZOOM_LEVELS[FeeAmount.MEDIUM]
      }

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

  const handleApprove = (type: TYPE_SWAP) => {
    if (type === 'BASE') {
      loadingApprove0.value = true
      approveToken(tokenA.value?.address as string, CONTRACT_ADDRESS.NONFUNGIBLE_POSITION_MANAGER, MAX_NUMBER_APPROVE, (status) => {
        if (status === 'SUCCESS') {
          refetchAllowance0()
        }
        loadingApprove0.value = false
      })
    } else {
      loadingApprove1.value = true
      approveToken(tokenB.value?.address as string, CONTRACT_ADDRESS.NONFUNGIBLE_POSITION_MANAGER, MAX_NUMBER_APPROVE, (status) => {
        if (status === 'SUCCESS') {
          refetchAllowance1()
        }
        loadingApprove1.value = false
      })
    }
  }

  const basisPointsToPercent = useMemoize((num: number): Percent => {
    return new Percent(BigInt(num), BIPS_BASE)
  })

  const { address } = useAccount()
  const { showToastMsg } = useShowToastMsg()
  const router = useRouter()

  const handleCreatePool = async () => {
    try {
      if (position.value?.liquidity === 0n) {
        ElMessage.error('The liquidity of this position is 0. Please try increasing the amount.')
        return
      }

      if (poolExits.value && position.value) {
        setOpenPopup('popup-add-liquidity')
        return
      }

      loadingAdd.value = true

      if (position.value) {
        const useNative = baseCurrency.value?.isNative ? baseCurrency.value : quoteCurrency.value?.isNative ? quoteCurrency.value : undefined
        console.log('🚀 ~ handleCreatePool ~ useNative:', position.value.mintAmounts)

        const deadline = Math.floor(Date.now() / 1000) + 5 * 60 // 5 minutes
        const allowedSlippage = 50

        console.log('🚀 ~ onAdd ~ option:', {
          slippageTolerance: basisPointsToPercent(allowedSlippage),
          recipient: address.value,
          deadline: deadline.toString(),
          useNative,
          createPool: noLiquidity.value
        })

        const { calldata, value } = NonfungiblePositionManager.addCallParameters(position.value, {
          slippageTolerance: basisPointsToPercent(allowedSlippage),
          recipient: address.value!,
          deadline: deadline.toString(),
          useNative,
          createPool: noLiquidity.value
        })
        console.log('🚀 ~ handleCreatePool ~ value:', value)
        console.log('🚀 ~ handleCreatePool ~ calldata:', calldata)

        const txHash = await sendTransaction(config, {
          to: CONTRACT_ADDRESS.NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
          data: calldata,
          value: hexToBigInt(value)
        })
        console.log('🚀 ~ handleCreatePool ~ txHash:', txHash)

        const { status } = await waitForTransactionReceipt(config, {
          hash: txHash,

          pollingInterval: 2000
        })

        if (status === 'success') {
          resetFiled()
          refetchBalance0()
          refetchBalance1()
          refetchAllowance0()
          refetchAllowance1()
          showToastMsg('Transaction successful', 'success', txHash)
          router.push('/liquidity/positions')
        } else {
          ElMessage.error('Transaction failed')
          showToastMsg('Transaction failed', 'error', txHash)
        }
      }
    } catch (error: unknown) {
      //@ts-ignore
      const msg = error?.shortMessage || null
      if (msg) {
        ElMessage.error(msg)
      }
    } finally {
      loadingAdd.value = false
    }
  }

  const handleBlurStartValue = () => {
    startPriceTypedValue.value = !startPriceTypedValue.value || !Number(startPriceTypedValue.value) ? '' : startPriceTypedValue.value
  }
</script>

<style lang="scss" scoped>
  .block-right {
    :deep(.input-init-amount) {
      color: red;
      .el-input__wrapper {
        box-shadow: unset;
        background-color: transparent;
        padding-right: 16px;
        border: 1px solid var(--color-gray-3);
        border-radius: 8px;

        .el-input__inner {
          height: 40px;
          font-size: 24px;
          font-weight: 600;
          overflow: hidden;
          color: var(--color-primary);
          text-align: right;
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
