<template>
  <BasePopup name="popup-add-liquidity" width="540" :title="title" @close="handleClose" @open="handleOpen">
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
    <div class="mt-[30px] px-8 py-[18px]">
      <div class="rounded-lg border border-solid border-gray-2 bg-gray-1 pb-[18px]">
        <div class="flex items-center justify-between gap-2 px-8">
          <div class="flex items-center gap-[10px]">
            <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
            <div class="flex flex-col">
              <span class="text-base font-semibold">{{ currency0?.symbol }}</span>
              <span class="text-xs text-[#6F6A79]">{{ currency0?.name }}</span>
            </div>
          </div>
          <div class="flex flex-col text-right">
            <span class="text-[32px] font-semibold">{{ formattedValue0 }}</span>
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
            <span class="text-[32px] font-semibold">{{ formattedValue1 }}</span>
            <span class="text-sm font-semibold text-gray-6">$0</span>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between border-t border-solid border-t-gray-3 px-8 pt-5">
          <span>Fee Tier</span>
          <span class="font-semibold">{{ props.feeFormat }}</span>
        </div>
      </div>
    </div>
    <div class="my-5 px-8">
      <div class="mt-7 flex items-center gap-3">
        <span class="text-lg font-semibold leading-7">Set price range</span>
        <div class="flex cursor-pointer items-center gap-2" @click="handleClickViewPriceRange">
          <BaseIcon :name="sorted ? 'radio-fill' : 'radio'" size="24" />
          <span class="text-base">{{ currency0?.symbol }}</span>
        </div>

        <div class="flex cursor-pointer items-center gap-2" @click="handleClickViewPriceRange">
          <BaseIcon :name="!sorted ? 'radio-fill' : 'radio'" size="24" />
          <span class="text-base">{{ currency1?.symbol }}</span>
        </div>
      </div>

      <div class="mt-6 grid h-[186px] grid-cols-2 grid-rows-2 rounded-lg border border-solid border-gray-2 bg-gray-1">
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
      <div v-if="step === 'INPUT' && props.showInput" class="mt-[30px] flex flex-col gap-4">
        <InputDepositLiquidity
          v-model:amount="form.amountDeposit0"
          :token="currencyA"
          type="BASE"
          is-selected
          :balance="balance0?.formatted"
          @change="handleChangeAmount"
          @select-percent="handleSelectPercent"
        />
        <InputDepositLiquidity
          v-model:amount="form.amountDeposit1"
          :token="currencyB"
          type="QUOTE"
          is-selected
          :balance="balance1?.formatted"
          @change="handleChangeAmount"
          @select-percent="handleSelectPercent"
        />
      </div>
      <GroupButtonLiquidity v-if="step === 'INPUT'" :loading0="loadingApprove0" :loading1="loadingApprove1" @approve="handleApprove" @add="step = 'CONFIRM'" />
      <BaseButton v-if="step === 'CONFIRM'" :loading="loadingAdd" size="md" class="mt-[33px] w-full text-xl font-semibold" @click="handleAddLiquidity">
        Confirm
      </BaseButton>
    </div>
  </BasePopup>
</template>

<script lang="ts" setup>
  import { Percent, type Currency } from '@pancakeswap/swap-sdk-core'
  import { NonfungiblePositionManager, type Position } from '@pancakeswap/v3-sdk'
  import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import { useAccount } from '@wagmi/vue'
  import Decimal from 'decimal.js'
  import { hexToBigInt } from 'viem'
  import { config } from '~/config/wagmi'
  import { BIPS_BASE } from '~/constant'
  import { CONTRACT_ADDRESS, MAX_NUMBER_APPROVE } from '~/constant/contract'
  import { Bound, CurrencyField, type IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'

  interface IProps {
    valueUpper: string
    valueLower: string
    currencyQuote: Currency | undefined
    currencyBase: Currency | undefined
    feeFormat: string
    position: Position | undefined
    showInput?: boolean
  }

  const props = withDefaults(defineProps<IProps>(), {
    valueUpper: '',
    valueLower: '',
    currencyBase: undefined,
    currencyQuote: undefined,
    feeFormat: '',
    position: undefined,
    showInput: true
  })

  const emit = defineEmits<{
    reload: []
    confirm: []
  }>()

  const loadingApprove0 = ref(false)
  const loadingApprove1 = ref(false)
  const loadingAdd = ref(false)
  const step = ref<'INPUT' | 'CONFIRM'>('INPUT')

  const { form, balance0, balance1, typedValue, independentField } = storeToRefs(useLiquidityStore())
  const { refetchAllowance0, refetchAllowance1, refetchBalance0, refetchBalance1 } = useLiquidityStore()
  const { setOpenPopup } = useBaseStore()

  const { address } = useAccount()

  const title = computed(() => {
    return step.value === 'INPUT'
      ? currency0.value && currency1.value
        ? `Add ${currency0.value.symbol}-${currency1.value.symbol} Liquidity`
        : ''
      : 'Confirm increase liquidity'
  })

  const invert = ref(false)

  const { ticksAtLimit, dependentAmount, independentAmount, parsedAmounts, currencies, position: positionDetail } = useV3DerivedInfo()

  const currencyA = computed(() => currencies.value[CurrencyField.CURRENCY_A] as unknown as IToken)
  const currencyB = computed(() => currencies.value[CurrencyField.CURRENCY_B] as unknown as IToken)

  const currency0 = computed(() => unwrappedToken(props.position?.pool.token0))
  const currency1 = computed(() => unwrappedToken(props.position?.pool.token1))

  const formattedValue0 = computed(() => {
    return props.showInput ? props.valueUpper : formattedCurrencyAmount(props.position?.amount0)
  })
  const formattedValue1 = computed(() => {
    return props.showInput ? props.valueLower : formattedCurrencyAmount(props.position?.amount1)
  })

  const baseCurrency = ref<Currency>()

  const sorted = computed(() => baseCurrency.value === currency0.value)
  const quoteCurrency = computed(() => (sorted.value ? currency1.value : currency0.value))

  const subtitle = computed(() => {
    return `${quoteCurrency.value?.symbol} per ${baseCurrency.value?.symbol}`
  })

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
    return formatTickPrice(priceLower.value, ticksAtLimit.value, Bound.LOWER, 'en-US')
  })
  const formattedPriceUpper = computed(() => {
    return formatTickPrice(priceUpper.value, ticksAtLimit.value, Bound.UPPER, 'en-US')
  })

  watchEffect(() => {
    if (props.currencyBase) {
      baseCurrency.value = props.currencyBase
        ? props.currencyBase === currency0.value
          ? currency0.value
          : props.currencyBase === currency1.value
            ? currency1.value
            : currency0.value
        : currency0.value
    }
  })

  const handleClickViewPriceRange = () => {
    // invert.value = !invert.value
    baseCurrency.value = quoteCurrency.value
  }

  const handleChangeAmount = (value: string, type: TYPE_SWAP) => {
    if (type === 'BASE') {
      form.value.amountDeposit0 = value
    } else {
      form.value.amountDeposit1 = value
    }
    typedValue.value = value
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

  watch(
    () => independentAmount.value,
    (value) => {
      if (value) {
        form.value.amountDeposit0 = parsedAmounts.value[CurrencyField.CURRENCY_A]?.toSignificant(5) || ''
      } else {
        form.value.amountDeposit0 = ''
      }
    }
  )

  watch(
    () => dependentAmount.value,
    (value) => {
      if (value && typedValue.value) {
        if (independentField.value === CurrencyField.CURRENCY_A) {
          form.value.amountDeposit1 = parsedAmounts.value[CurrencyField.CURRENCY_B]?.toSignificant(5) || ''
        }
        if (independentField.value === CurrencyField.CURRENCY_B) {
          form.value.amountDeposit0 = parsedAmounts.value[CurrencyField.CURRENCY_A]?.toSignificant(5) || ''
        }
      } else {
        form.value.amountDeposit1 = ''
      }
    }
  )

  const handleOpen = () => {
    loadingAdd.value = false
    loadingApprove0.value = false
    loadingApprove1.value = false
    if (props.showInput === false) {
      step.value = 'CONFIRM'
    }
  }

  const handleClose = () => {
    if (props.showInput) {
      typedValue.value = ''
      form.value.amountDeposit0 = ''
      form.value.amountDeposit1 = ''
      independentField.value = CurrencyField.CURRENCY_A
      invert.value = false
      step.value = 'INPUT'
    }
  }

  const { approveToken } = useApproveToken()

  const handleApprove = (type: TYPE_SWAP) => {
    if (type === 'BASE') {
      loadingApprove0.value = true
      approveToken(currencyA.value?.address as string, CONTRACT_ADDRESS.NONFUNGIBLE_POSITION_MANAGER, MAX_NUMBER_APPROVE, (status) => {
        if (status === 'SUCCESS') {
          refetchAllowance0()
        }
        loadingApprove0.value = false
      })
    } else {
      loadingApprove1.value = true
      approveToken(currencyB.value?.address as string, CONTRACT_ADDRESS.NONFUNGIBLE_POSITION_MANAGER, MAX_NUMBER_APPROVE, (status) => {
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

  const route = useRoute('liquidity-tokenId')
  const { showToastMsg } = useShowToastMsg()

  const handleAddLiquidity = async () => {
    try {
      if (!form.value.amountDeposit0 || !form.value.amountDeposit1 || !currencyA.value || !currencyB.value) {
        return
      }

      if (positionDetail.value) {
        loadingAdd.value = true
        console.log(positionDetail.value.mintAmounts)

        const useNative = baseCurrency.value?.isNative ? baseCurrency.value : quoteCurrency.value?.isNative ? quoteCurrency.value : undefined
        const deadline = Math.floor(Date.now() / 1000) + 5 * 60 // 5 minutes
        const allowedSlippage = 50

        let calldata: `0x${string}` = '0x'
        let value: `0x${string}` = '0x'

        if (props.showInput) {
          const { calldata: hexCall, value: hexValue } = NonfungiblePositionManager.addCallParameters(positionDetail.value, {
            tokenId: route.params.tokenId,
            slippageTolerance: basisPointsToPercent(allowedSlippage),
            deadline: deadline.toString(),
            useNative
          })
          calldata = hexCall
          value = hexValue
        } else {
          const { calldata: hexCall, value: hexValue } = NonfungiblePositionManager.addCallParameters(positionDetail.value, {
            slippageTolerance: basisPointsToPercent(allowedSlippage),
            recipient: address.value!,
            deadline: deadline.toString(),
            useNative,
            createPool: !positionDetail.value
          })
          calldata = hexCall
          value = hexValue
        }

        console.log('🚀 ~ handleAddLiquidity ~ value:', value)
        console.log('🚀 ~ handleAddLiquidity ~ calldata:', calldata)

        const txHash = await sendTransaction(config, {
          to: CONTRACT_ADDRESS.NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
          data: calldata,
          value: hexToBigInt(value)
        })
        console.log('🚀 ~ handleAddLiquidity ~ txHash:', txHash)

        const { status } = await waitForTransactionReceipt(config, {
          hash: txHash,

          pollingInterval: 2000
        })

        if (status === 'success') {
          refetchBalance0()
          refetchBalance1()
          setOpenPopup('popup-add-liquidity', false)
          showToastMsg('Transaction successful', 'success', txHash)
          emit('reload')
          if (props.showInput === false) {
            typedValue.value = ''
            form.value.amountDeposit0 = ''
            form.value.amountDeposit1 = ''
            independentField.value = CurrencyField.CURRENCY_A
            invert.value = false
            step.value = 'INPUT'
          }
        } else {
          showToastMsg('Transaction failed', 'error', txHash)
        }
      }
    } catch (error: unknown) {
      //@ts-ignore
      const msg = error?.shortMessage || null
      if (msg) {
        showToastMsg(msg, 'error')
      }
    } finally {
      loadingAdd.value = false
    }
  }
</script>

<style lang="scss"></style>
