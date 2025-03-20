<template>
  <BasePopup name="popup-add-liquidity" width="540" @close="handleClose" @open="handleOpen">
    <template #title>
      <div class="flex items-center gap-2">
        <BaseIcon v-if="props.showInput && step === 'CONFIRM'" name="arrow-down" size="24" class="rotate-90 cursor-pointer" @click="step = 'INPUT'" />
        <div class="text-xl font-semibold">{{ title }}</div>
      </div>
    </template>
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
      <div class="flex h-[215px] flex-col rounded-lg border border-solid border-gray-2 bg-gray-1 pt-4">
        <div class="flex h-[49px] items-center justify-between gap-2 px-8">
          <div class="flex items-center gap-[10px]">
            <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
            <div class="flex flex-col">
              <span class="text-base font-semibold">{{ currency0?.symbol }}</span>
              <span class="text-xs text-[#6F6A79]">{{ currency0?.name }}</span>
            </div>
          </div>
          <div class="flex flex-col text-right">
            <template v-if="props.showInput && step === 'CONFIRM'">
              <span class="text-[32px] font-semibold leading-none">{{ formattedStep2Amount0 }}</span>
              <span class="text-sm font-semibold text-gray-6">${{ formatNumber(priceUsdBase) }}</span>
            </template>
            <template v-else>
              <span class="text-[32px] font-semibold leading-none">{{ formattedValue0 }}</span>
              <span class="text-sm font-semibold text-gray-6">${{ formatNumber(props.usdUpper) }}</span>
            </template>
          </div>
        </div>
        <div class="ml-8 h-[30px] w-5 border-r-2 border-dashed border-gray-6" />
        <div class="mb-[14px] flex h-[49px] items-center justify-between gap-2 px-8">
          <div class="flex items-center gap-[10px]">
            <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
            <div class="flex flex-col">
              <span class="text-base font-semibold">{{ currency1?.symbol }}</span>
              <span class="text-xs text-[#6F6A79]">{{ currency1?.name }}</span>
            </div>
          </div>
          <div class="flex flex-col text-right">
            <template v-if="props.showInput && step === 'CONFIRM'">
              <span class="text-[32px] font-semibold leading-none">{{ formattedStep2Amount1 }}</span>
              <span class="text-sm font-semibold text-gray-6">${{ formatNumber(priceUsdQuote) }}</span>
            </template>
            <template v-else>
              <span class="text-[32px] font-semibold leading-none">{{ formattedValue1 }}</span>
              <span class="text-sm font-semibold text-gray-6">${{ formatNumber(props.usdLower) }}</span>
            </template>
          </div>
        </div>
        <div class="flex flex-1 items-center justify-between border-t border-solid border-t-gray-3 px-8">
          <span>Fee Tier</span>
          <span class="font-semibold">{{ feeFormat }}</span>
        </div>
      </div>
    </div>
    <div class="mt-[22px] px-8">
      <div class="flex items-center gap-3">
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

      <div class="mt-[23px] grid h-[190px] grid-cols-2 grid-rows-2 rounded-lg border border-solid border-gray-2 bg-gray-1">
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
          :token="currency0"
          type="BASE"
          is-selected
          :balance="balance0?.formatted"
          :locked="depositADisabled"
          @change="handleChangeAmount"
          @select-percent="handleSelectPercent"
        />
        <InputDepositLiquidity
          v-model:amount="form.amountDeposit1"
          :token="currency1"
          type="QUOTE"
          is-selected
          :balance="balance1?.formatted"
          :locked="depositBDisabled"
          @change="handleChangeAmount"
          @select-percent="handleSelectPercent"
        />
      </div>
      <GroupButtonLiquidity
        v-if="step === 'INPUT'"
        class="mb-[34px]"
        :loading0="loadingApprove0"
        :loading1="loadingApprove1"
        @approve="handleApprove"
        @add="step = 'CONFIRM'"
      />
      <BaseButton v-if="step === 'CONFIRM'" :loading="loadingAdd" size="md" class="mb-[34px] mt-6 w-full text-xl font-semibold" @click="handleAddLiquidity">
        Confirm
      </BaseButton>
    </div>
  </BasePopup>
</template>

<script lang="ts" setup>
  import NonfungiblePositionManagerABI from '@/constant/abi/nonfungiblePositionManagerABI.json'
  import { Percent, type Currency } from '@monchain/swap-sdk-core'
  import { type Position } from '@monchain/v3-sdk'
  import { readContract, sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import { useAccount } from '@wagmi/vue'
  import Decimal from 'decimal.js'
  import { hexToBigInt } from 'viem'
  import { config } from '~/config/wagmi'
  import { BIPS_BASE, MAX_NUMBER_APPROVE } from '~/constant'
  import { Bound, CurrencyField, type IToken } from '~/types'
  import type { IBodyTxCollect } from '~/types/encrypt.type'
  import type { TYPE_SWAP } from '~/types/swap.type'
  import { NonfungiblePositionManager } from '~/utils/nonfungiblePositionManager'

  interface IProps {
    valueUpper: string
    valueLower: string
    currencyQuote: Currency | undefined
    currencyBase: Currency | undefined
    feeFormat: string
    position: Position | undefined
    showInput?: boolean
    usdUpper?: string
    usdLower?: string
  }

  const props = withDefaults(defineProps<IProps>(), {
    valueUpper: '',
    valueLower: '',
    currencyBase: undefined,
    currencyQuote: undefined,
    feeFormat: '',
    position: undefined,
    showInput: true,
    usdUpper: '',
    usdLower: ''
  })

  const emit = defineEmits<{
    reload: []
    confirm: []
  }>()

  const loadingApprove0 = ref(false)
  const loadingApprove1 = ref(false)
  const loadingAdd = ref(false)
  const step = ref<'INPUT' | 'CONFIRM'>('INPUT')

  const { form, balance0, balance1, typedValue, independentField, exchangeRateBaseCurrency, exchangeRateQuoteCurrency } = storeToRefs(useLiquidityStore())
  const { refetchAllowance0, refetchAllowance1, refetchBalance0, refetchBalance1 } = useLiquidityStore()
  const { setOpenPopup } = useBaseStore()
  const { currentNetwork } = storeToRefs(useBaseStore())

  const { address } = useAccount()

  const title = computed(() => {
    return step.value === 'INPUT'
      ? currency0.value && currency1.value
        ? `Add ${currency0.value.symbol}-${currency1.value.symbol} Liquidity`
        : ''
      : 'Confirm increase liquidity'
  })

  const invert = ref(false)

  const {
    ticksAtLimit,
    dependentAmount,
    formattedAmounts,
    currencies,
    position: positionDetail,
    depositADisabled,
    depositBDisabled,
    poolAddresses
  } = useV3DerivedInfo()

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

  const formattedStep2Amount0 = computed(() => {
    return formattedCurrencyAmount(positionDetail.value?.amount0)
  })
  const formattedStep2Amount1 = computed(() => {
    return formattedCurrencyAmount(positionDetail.value?.amount1)
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

  const priceUsdBase = computed(() => {
    if (form.value.amountDeposit0) {
      return new Decimal(form.value.amountDeposit0).mul(exchangeRateBaseCurrency.value).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const priceUsdQuote = computed(() => {
    if (form.value.amountDeposit1) {
      return new Decimal(form.value.amountDeposit1).mul(exchangeRateQuoteCurrency.value).toSignificantDigits(6).toString()
    }
    return '0'
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
    const _value = !value || !Number(value) ? '' : value
    if (type === 'BASE') {
      form.value.amountDeposit0 = _value
    } else {
      form.value.amountDeposit1 = _value
    }
    typedValue.value = _value
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

  /**
   * This watcher is used to update the dependent amount when the independent amount changes
   * IMPORTANT: It also use in component BlockAddLiquidityLeft
   * Refactor it in the future if i have time :D
   */
  watch(
    () => dependentAmount.value,
    (value) => {
      if (value && typedValue.value) {
        form.value.amountDeposit0 = formattedAmounts.value[CurrencyField.CURRENCY_A]
        form.value.amountDeposit1 = formattedAmounts.value[CurrencyField.CURRENCY_B]
      } else {
        form.value.amountDeposit0 = formattedAmounts.value[CurrencyField.CURRENCY_A] ?? ''
        form.value.amountDeposit1 = formattedAmounts.value[CurrencyField.CURRENCY_B] ?? ''
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
  const { chainId } = useActiveChainId()

  const handleApprove = (type: TYPE_SWAP) => {
    const contractAddress = getNftPositionManagerAddress(chainId.value)
    if (!contractAddress) throw new Error('Invalid contract address')
    if (type === 'BASE') {
      loadingApprove0.value = true
      approveToken(currencyA.value?.address as string, contractAddress, MAX_NUMBER_APPROVE, (status) => {
        if (status === 'SUCCESS') {
          refetchAllowance0()
        }
        loadingApprove0.value = false
      })
    } else {
      loadingApprove1.value = true
      approveToken(currencyB.value?.address as string, contractAddress, MAX_NUMBER_APPROVE, (status) => {
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

  const route = useRoute('liquidity-network-tokenId')
  const router = useRouter()
  const { showToastMsg } = useShowToastMsg()

  const handleAddLiquidity = async () => {
    try {
      if (!currencyA.value || !currencyB.value) {
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

        const contractAddress = getNftPositionManagerAddress(chainId.value)
        if (!contractAddress) throw new Error('Invalid contract address')

        const txHash = await sendTransaction(config, {
          to: contractAddress,
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
          let body: IBodyTxCollect = {} as IBodyTxCollect

          if (props.showInput === false) {
            // page create pool
            typedValue.value = ''
            form.value.amountDeposit0 = ''
            form.value.amountDeposit1 = ''
            independentField.value = CurrencyField.CURRENCY_A
            invert.value = false
            step.value = 'INPUT'
            router.push('/liquidity/positions')
            const balance = await readContract(config, {
              address: contractAddress,
              functionName: 'balanceOf',
              args: [address.value],
              abi: NonfungiblePositionManagerABI
            })
            const tokenId = await readContract(config, {
              address: contractAddress,
              functionName: 'tokenOfOwnerByIndex',
              args: [address.value, Number(balance) - 1],
              abi: NonfungiblePositionManagerABI
            })

            body = {
              transactionHash: txHash,
              poolAddress: poolAddresses.value ? poolAddresses.value[0] : '',
              tokenId: Number(tokenId),
              fromAddress: address.value!,
              toAddress: contractAddress,
              fromToken: positionDetail.value.pool.token0.address,
              toToken: positionDetail.value.pool.token1.address,
              network: currentNetwork.value.network,
              transactionType: 'ADD_POSITION'
            }
          } else {
            body = {
              transactionHash: txHash,
              poolAddress: poolAddresses.value ? poolAddresses.value[0] : '',
              tokenId: +route.params.tokenId,
              fromAddress: address.value!,
              toAddress: contractAddress,
              fromToken: positionDetail.value.pool.token0.address,
              toToken: positionDetail.value.pool.token1.address,
              network: currentNetwork.value.network,
              transactionType: 'INCREASE_LIQUID'
            }
          }
          await postTransaction(body)
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
