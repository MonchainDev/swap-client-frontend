<template>
  <div class="flex flex-col gap-2 rounded-lg bg-white px-8 pb-10 pt-[21px] shadow-md sm:p-4">
    <HeaderFormSwap v-model:step-swap="stepSwap" :title="formatTitle" :is-confirm-approve="isConfirmApprove" :is-swapping="isSwapping" />
    <div class="relative mt-7 flex flex-col gap-1 sm:mt-[14px]">
      <template v-if="stepSwap === 'SELECT_TOKEN'">
        <InputSwap
          v-model:amount="form.amountIn"
          :is-selected="isToken0Selected"
          :token="form.token0"
          :balance="balance0?.formatted"
          :step-swap
          :amount-usd="amountUsd"
          type="BASE"
          class="h-[138px] bg-[#EFEFFF] sm:h-[120px]"
          @select-token="handleOpenPopupSelectToken"
          @change="handleInput"
        />
        <div class="relative z-10 select-none">
          <div
            class="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-[4px] border-solid border-white bg-[#1573FE] p-2 sm:size-9"
            @click="handleSwapOrder"
          >
            <BaseIcon v-if="stepSwap === 'SELECT_TOKEN'" name="repeat" class="text-white" :size="isDesktop ? '24' : '18'" />
            <BaseIcon v-else name="arrow-down-bold" class="text-white" :size="isDesktop ? '24' : '18'" />
          </div>
        </div>
        <InputSwap
          v-model:amount="form.amountOut"
          :is-selected="isToken1Selected"
          :token="form.token1"
          :balance="balance1?.formatted"
          :step-swap
          type="QUOTE"
          class="h-[124px] bg-[#F3F8FF] sm:h-[100px]"
          @select-token="handleOpenPopupSelectToken"
          @change="handleInput"
        />
      </template>
      <template v-else>
        <div class="rounded-lg border border-solid border-gray-3 bg-[#FAFAFA] px-8 py-4 sm:p-4">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-[10px]">
              <img :src="form.token0.icon_url" alt="logo" class="size-9 rounded-full" @error="handleImageError($event)" />
              <div class="flex flex-col">
                <span class="text-base font-semibold">{{ form.token0.symbol }}</span>
                <span class="text-xs text-[#6F6A79]">{{ form.token0.name }}</span>
              </div>
            </div>
            <div class="flex flex-col text-right">
              <span class="text-[32px] font-semibold leading-7">{{ form.amountIn }}</span>
              <span class="text-sm font-semibold text-gray-6">≈ ${{ amountUsd }}</span>
            </div>
          </div>
          <div class="relative flex items-center justify-between gap-2 pt-[38px]">
            <img src="/line-arrow.png" class="absolute left-4 top-0 h-[63px] sm:w-5" />
            <div class="flex items-center gap-[10px] pl-[63px] sm:pl-[46px]">
              <img :src="form.token0.icon_url" alt="logo" class="size-9 rounded-full" @error="handleImageError($event)" />
              <div class="flex flex-col">
                <div class="line-clamp-1 text-base font-semibold">{{ form.token1.symbol }}</div>
                <div class="line-clamp-1 text-xs text-[#6F6A79]">{{ form.token1.name }}</div>
              </div>
            </div>
            <span class="flex-1 text-right text-[32px] font-semibold leading-7">≈ {{ form.amountOut }}</span>
          </div>
        </div>
      </template>
    </div>

    <template v-if="isQuoteExist">
      <InfoSwap v-model:edit-slippage="isEditSlippage" :step-swap @change-slippage="handleChangeSlippage" />
    </template>

    <template v-if="!isEditSlippage">
      <button
        v-if="isConnected"
        :disabled="isDisabledButton"
        class="bg-linear mt-5 flex h-[67px] items-center justify-center gap-2 rounded-lg text-xl font-semibold text-white hover:opacity-90 sm:h-[42px] sm:text-sm"
        :class="{ 'bg-gray pointer-events-none cursor-default': isSwapping || isConfirmApprove || isConfirmSwap, 'btn-disabled': isDisabledButton }"
        @click="handleSwap"
      >
        <BaseLoadingButton v-if="isFetchQuote || isSwapping || isConfirmApprove || isConfirmSwap" />
        <span>{{ msgButton }}</span>
      </button>
      <button
        v-else
        class="bg-linear mt-5 flex h-[67px] items-center justify-center gap-2 rounded-lg text-xl font-semibold text-white hover:opacity-90 sm:h-[42px] sm:text-sm"
        @click="setOpenPopup('popup-connect')"
      >
        <template v-if="isFetchQuote">
          <BaseLoadingButton />
          <span>{{ msgButton }}</span>
        </template>
        <template v-else>
          <BaseIcon name="wallet" size="24" class="text-white" />
          <span class="uppercase">Connect Wallet</span>
        </template>
      </button>
    </template>

    <PopupSelectToken @select="handleSelectToken" />
  </div>
</template>

<script lang="ts" setup>
  import { type SmartRouterTrade, type V3Pool } from '@monchain/smart-router'
  import { TradeType } from '@monchain/swap-sdk-core'
  import { estimateGas, sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import { useAccount } from '@wagmi/vue'
  import Decimal from 'decimal.js'
  import { encodeFunctionData, hexToBigInt, type Hex } from 'viem'
  import { config } from '~/config/wagmi'
  import { DEFAULT_SLIPPAGE, EMPTY_TOKEN, MAX_NUMBER_APPROVE } from '~/constant'
  import swapRouterABI from '~/constant/abi/swapRouter.json'
  import type { IToken } from '~/types'
  import type { IBodyTxCollect } from '~/types/encrypt.type'
  import type { TYPE_SWAP } from '~/types/swap.type'
  import { type SwapOutput } from '~/utils/getBestTrade'
  import HeaderFormSwap from './HeaderFormSwap.vue'
  // import { SwapRouter, type SwapOptions } from '~/composables/swapRouter'

  export type StepSwap = 'SELECT_TOKEN' | 'CONFIRM_SWAP'

  interface IProps {
    title?: string
  }

  const _props = withDefaults(defineProps<IProps>(), {
    title: 'Swap'
  })

  const { setOpenPopup } = useBaseStore()
  const { isDesktop, currentNetwork } = storeToRefs(useBaseStore())

  const { isSwapping, isConfirmApprove, exchangeRateBaseCurrency, slippage, isConfirmSwap, allowance0, balance0, balance1, form, token0, token1 } =
    storeToRefs(useSwapStore())
  const { refetchAllowance0, refetchBalance0, refetchBalance1 } = useSwapStore()

  const isEditSlippage = ref(false)
  const stepSwap = ref<StepSwap>('SELECT_TOKEN')
  // const buyAmount = ref('')
  // const sellAmount = ref('')

  // const trades = ref<SmartRouterTrade<TradeType>>()

  const bestTrade = ref<SmartRouterTrade<TradeType> | undefined>(undefined)

  const isFetchQuote = ref(false)

  const isToken0Selected = computed(() => form.value.token0.symbol !== '')
  const isToken1Selected = computed(() => form.value.token1.symbol !== '')
  const isQuoteExist = computed(() => form.value.amountOut && form.value.amountIn)
  const formatTitle = computed(() => {
    return stepSwap.value === 'SELECT_TOKEN' ? _props.title : 'Confirm swap'
  })

  const amountUsd = computed(() => {
    const quantity = new Decimal(form.value.amountIn || 0)
    const rate = exchangeRateBaseCurrency.value
    return quantity && rate ? formatNumber(quantity.mul(rate).toSignificantDigits(6, Decimal.ROUND_DOWN).toString()) : '0'
  })

  const noRoute = computed(() => !(((bestTrade.value && bestTrade.value?.routes.length) ?? 0) > 0))
  const notEnoughLiquidity = ref(false)

  const isInsufficientBalance = computed(() => {
    const amountA = form.value.amountIn || 0
    const balanceA = balance0.value?.formatted || 0
    return new Decimal(amountA).greaterThan(balanceA)
  })
  /*
   * Message button
   * case 1: Select a token
   * case 2: Enter an amount
   * case 3: Finalizing quote...
   * case 4: Swap {sellAmount} {token0.symbol} ⇒ {buyAmount} {token1.symbol}
   * case 7: APPROVE AND SWAP
   * case 6: CONFIRM IN WALLET
   * case 5: SWAPPING! PLEASE WAIT..
   */
  const msgButton = computed(() => {
    if (isSwapping.value) {
      return 'SWAPPING! PLEASE WAIT..'
    } else if (!isToken0Selected.value || !isToken1Selected.value) {
      return 'Select a token'
    } else if (isFetchQuote.value) {
      return 'Finalizing quote...'
    } else if (
      (!isFetchQuote.value &&
        noRoute.value &&
        isToken0Selected.value &&
        isToken1Selected.value &&
        (Number(form.value.amountIn) || Number(form.value.amountOut))) ||
      notEnoughLiquidity.value
    ) {
      return 'Insufficient liquidity for this trade'
    } else if (isToken0Selected.value && isToken1Selected.value && form.value.amountOut && form.value.amountIn) {
      if (stepSwap.value === 'SELECT_TOKEN') {
        if (isInsufficientBalance.value) {
          return `Insufficient ${form.value.token0.symbol} balance`
        }
        return `Swap ${bestTrade.value?.inputAmount.toSignificant(6)} ${form.value.token0.symbol} ⇒ ${bestTrade.value?.outputAmount.toSignificant(6)} ${form.value.token1.symbol}`
      } else {
        if (isSwapping.value) {
          return 'SWAPPING! PLEASE WAIT..'
        } else {
          if (isNeedAllowance0.value) {
            return `APPROVE ${form.value.token0.symbol}`
          }
          return isConfirmApprove.value || isConfirmSwap.value ? 'CONFIRM IN WALLET' : 'SWAP'
        }
      }
    } else {
      return 'Enter an amount'
    }
  })

  const isDisabledButton = computed(() => {
    return (
      !isToken0Selected.value ||
      !isToken1Selected.value ||
      !Number(form.value.amountIn) ||
      !Number(form.value.amountOut) ||
      isFetchQuote.value ||
      noRoute.value ||
      notEnoughLiquidity.value ||
      isInsufficientBalance.value
    )
  })

  const handleSwapOrder = () => {
    if (stepSwap.value === 'CONFIRM_SWAP') return
    ;[form.value.token0, form.value.token1] = [form.value.token1, form.value.token0]
    form.value.amountIn = form.value.amountOut
    form.value.amountOut = ''
    handleInput(form.value.amountIn, 'BASE')
  }

  const typeOpenPopup = ref<TYPE_SWAP>('BASE')
  const handleOpenPopupSelectToken = (type: TYPE_SWAP) => {
    if (stepSwap.value === 'CONFIRM_SWAP') return
    typeOpenPopup.value = type
    setOpenPopup('popup-select-token', true)
  }

  const poolAddress = ref<string>('')
  const typedValue = ref('')
  const currentTypeInput = ref<TYPE_SWAP>('BASE')

  const getTokenInfo = async (address: string) => {
    // const currency = form.value.token1.address.toLowerCase()
    const { token: native } = useNativeCurrency(currentNetwork.value.chainId)
    const isNative = address === zeroAddress
    if (isNative) {
      return native.value
    } else {
      const item = await getTokenByChainId(address, currentNetwork.value.chainId)
      return item
    }
  }

  // const calcTradingFee = () => {
  //   const routes = (bestTrade.value as SwapOutput)?.routes

  //   let totalFeeWei = BigInt(0)
  //   for (const route of routes) {
  //     const inputAmountRaw = route.inputAmount.numerator
  //     const inputAmount = BigInt(inputAmountRaw)
  //     const pools = (route.pools || []) as V3Pool[]
  //     for (const pool of pools) {
  //       const poolFeeBps = BigInt(pool.fee || 0)
  //       // Calculate fee for this pool (inputAmount * fee / 1000000)
  //       const poolFeeWei = (inputAmount * poolFeeBps) / BigInt(1000000)
  //       totalFeeWei += poolFeeWei
  //     }
  //   }
  //   console.log('🚀 ~ calcTradingFee ~ totalFeeWei:', totalFeeWei)

  //   return totalFeeWei
  // }

  let latestRequestId = 0
  const handleInput = async (amount: string, type: TYPE_SWAP) => {
    if (amount.trim() === '' || Number(amount) === 0) {
      form.value.amountIn = type === 'BASE' ? amount : ''
      form.value.amountOut = type === 'QUOTE' ? amount : ''
      latestRequestId = 0
      isFetchQuote.value = false
      notEnoughLiquidity.value = false
      return
    }

    const requestId = ++latestRequestId
    try {
      notEnoughLiquidity.value = false
      typedValue.value = amount
      currentTypeInput.value = type
      if (!isToken0Selected.value || !isToken1Selected.value) return
      isFetchQuote.value = true
      if (!amount) {
        isFetchQuote.value = false
        form.value.amountOut = ''
        form.value.amountIn = ''
        isEditSlippage.value = false
        slippage.value = DEFAULT_SLIPPAGE
        return
      }
      const tokenA = await getTokenInfo(form.value.token0.address)
      const tokenB = await getTokenInfo(form.value.token1.address)

      if (type === 'BASE') {
        form.value.amountIn = amount
        form.value.amountOut = ''
        console.log('🚀 ~ handleInput ~ form.value.amountIn:', form.value.amountIn)
        const inputAmount = Number(form.value.amountIn) * ((10 ** Number(form.value.token0.decimals)) as number)
        console.log('🚀 ~ handleInput ~ inputAmount', inputAmount)
        // buyAmount.value = Number(amount) > 0 ? (Math.random() * 1000).toFixed(3) + '' : ''
        const _bestTrade = await getBestTradeV4ForSwapV2({
          token0: tokenA,
          token1: tokenB,
          inputAmount: inputAmount,
          type: TradeType.EXACT_INPUT,
          chainId: currentNetwork.value.chainId
        })
        console.log('🚀 ~ handleInput ~ _bestTrade:', _bestTrade)

        if (requestId !== latestRequestId) {
          console.log('🚀 ~ handleInput ~ Aborting: newer request detected')
          return
        }

        // slippage * 100 because computeSlippageAdjustedAmounts expect slippage in bips
        const { OUTPUT } = computeSlippageAdjustedAmounts(_bestTrade, +slippage.value * 100)

        bestTrade.value = _bestTrade
        poolAddress.value = (_bestTrade?.routes[0].pools[0] as V3Pool)?.address ?? ''
        form.value.amountOut = _bestTrade.outputAmount.toSignificant(6)
        form.value.minimumAmountOut = OUTPUT?.toSignificant(6)
        form.value.maximumAmountIn = ''

        // calc trading fee and price impact
        const { lpFeeAmount, priceImpactWithoutFee } = computeTradePriceBreakdown(_bestTrade)
        console.log('🚀 ~ handleInput ~ priceImpactWithoutFee:', priceImpactWithoutFee)
        console.log('🚀 ~ handleInput ~ lpFeeAmount:', lpFeeAmount)
        form.value.priceImpact = priceImpactWithoutFee ? (priceImpactWithoutFee?.lessThan(ONE_BIPS) ? '<0.01' : priceImpactWithoutFee?.toFixed(2)) : ''
        form.value.tradingFee = lpFeeAmount ? (formatAmount(lpFeeAmount, 4)?.toString() ?? '') : ''

        isFetchQuote.value = false
      } else {
        form.value.amountOut = amount
        form.value.amountIn = ''
        const inputAmount = Number(form.value.amountOut) * ((10 ** Number(form.value.token1.decimals)) as number)

        const _bestTrade = await getBestTradeV4ForSwapV2({
          token0: tokenA,
          token1: tokenB,
          inputAmount: inputAmount,
          type: TradeType.EXACT_OUTPUT,
          chainId: currentNetwork.value.chainId // chainId of wallet
        })

        if (requestId !== latestRequestId) {
          console.log('🚀 ~ handleInput ~ Aborting: newer request detected')
          return
        }

        if (_bestTrade) {
          console.log('🚀 ~ handleInput ~ _bestTrade:', _bestTrade)
          // slippage * 100 because computeSlippageAdjustedAmounts expect slippage in bips
          const { INPUT } = computeSlippageAdjustedAmounts(_bestTrade, +slippage.value * 100)

          bestTrade.value = _bestTrade
          form.value.amountIn = _bestTrade.inputAmount.toSignificant(6)
          form.value.maximumAmountIn = INPUT?.toSignificant(6)
          form.value.minimumAmountOut = ''
          // form.value.fee = _bestTrade.fee

          // calc trading fee and price impact
          const { lpFeeAmount, priceImpactWithoutFee } = computeTradePriceBreakdown(_bestTrade)
          console.log('🚀 ~ handleInput ~ lpFeeAmount:', lpFeeAmount?.toExact())
          console.log('🚀 ~ handleInput ~ priceImpactWithoutFee:', priceImpactWithoutFee?.toFixed(2))
          form.value.priceImpact = priceImpactWithoutFee ? (priceImpactWithoutFee?.lessThan(ONE_BIPS) ? '<0.01' : priceImpactWithoutFee?.toFixed(2)) : ''
          form.value.tradingFee = lpFeeAmount ? (formatAmount(lpFeeAmount, 4)?.toString() ?? '') : ''
        }
      }
      isFetchQuote.value = false
    } catch (_error) {
      console.error('🚀 ~ handleInput ~ _error:', _error)
      // Kiểm tra requestId trước khi xử lý lỗi
      if (requestId === latestRequestId) {
        console.error('🚀 ~ handleInput ~ _error:', _error)
        isFetchQuote.value = false
        notEnoughLiquidity.value = true
      }
    }
  }

  const handleSelectToken = (token: IToken) => {
    if (typeOpenPopup.value === 'BASE') {
      form.value.token0 = token
      if (token.address === form.value.token1.address) {
        form.value.token1 = { ...EMPTY_TOKEN }
        form.value.amountIn = ''
      }
    } else {
      form.value.token1 = token
      form.value.token0 = token.address === form.value.token0.address ? { ...EMPTY_TOKEN } : form.value.token0
      if (token.address === form.value.token0.address) {
        form.value.token0 = { ...EMPTY_TOKEN }
        form.value.amountOut = ''
      }
    }

    if (isToken0Selected.value && isToken1Selected.value) {
      if ((form.value.amountIn && !form.value.amountOut) || (form.value.amountIn && form.value.amountOut)) {
        handleInput(form.value.amountIn, 'BASE')
      } else if (!form.value.amountIn && form.value.amountOut) {
        handleInput(form.value.amountOut, 'QUOTE')
      }
    }
  }

  watch(isToken0Selected, () => {
    if (!isToken0Selected.value) {
      form.value.amountIn = ''
    }
  })

  watch(isToken1Selected, () => {
    if (!isToken1Selected.value) {
      form.value.amountOut = ''
    }
  })

  const { address, isConnected } = useAccount()
  const { chainId } = useActiveChainId()

  const token0IsToken = computed(() => form.value.token0.address !== '')

  // function encodePath(tokens: string[], fees: number[], tradeType: TradeType): `0x${string}` {
  //   if (tokens.length !== fees.length + 1) {
  //     throw new Error('Invalid path: tokens and fees mismatch')
  //   }

  //   let orderedTokens = tokens
  //   let orderedFees = fees

  //   if (tradeType === TradeType.EXACT_OUTPUT) {
  //     orderedTokens = [...tokens].reverse()
  //     orderedFees = [...fees].reverse()
  //   }

  //   let path = '0x'
  //   for (let i = 0; i < orderedFees.length; i++) {
  //     path += orderedTokens[i].slice(2) // Bỏ '0x' của địa chỉ token
  //     path += orderedFees[i].toString(16).padStart(6, '0') // Chuyển phí thành hex, đệm 6 chữ số
  //   }
  //   path += orderedTokens[orderedTokens.length - 1].slice(2) // Thêm token cuối

  //   return path as `0x${string}`
  // }

  function encodePath(tokenAddresses: string[], fees: number[]) {
    // Kiểm tra hợp lệ
    if (tokenAddresses.length < 2 || fees.length !== tokenAddresses.length - 1) {
      throw new Error('Đường dẫn hoặc phí không hợp lệ')
    }

    // Khởi tạo chuỗi path
    let path = '0x'

    // Duyệt qua các token và phí
    for (let i = 0; i < tokenAddresses.length; i++) {
      // Thêm địa chỉ token (bỏ '0x', giữ 40 ký tự hex)
      const token = tokenAddresses[i]
      if (!token.startsWith('0x') || token.length !== 42) {
        throw new Error(`Địa chỉ token không hợp lệ: ${token}`)
      }
      path += token.slice(2) // Bỏ '0x'

      // Thêm phí nếu không phải token cuối
      if (i < fees.length) {
        const fee = fees[i]
        if (!Number.isInteger(fee) || fee < 0) {
          throw new Error(`Phí không hợp lệ: ${fee}`)
        }
        // Chuyển phí thành hex, đệm đủ 6 ký tự (3 bytes)
        const feeHex = fee.toString(16).padStart(6, '0')
        path += feeHex
      }
    }

    return path
  }

  const { showToastMsg } = useShowToastMsg()

  const useExecuteSwap = async (swapOut: SmartRouterTrade<TradeType>) => {
    const trade = swapOut
    console.info(' (FormSwap.client.vue:355) trade', trade)
    const datas: Hex[] = []
    const outputTokenIsNative = form.value.token1.address === zeroAddress

    const contractSwapRouterV3 = getSwapRouterV3Address(chainId.value)
    if (!contractSwapRouterV3) throw new Error('Invalid contract address')

    // Handle routes properly - make sure we're accessing the correct structure
    const routes = trade.routes || []
    console.log(`--- SWAP TYPE ${bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? 'EXACT_INPUT' : 'EXACT_OUTPUT'} ---`)

    for (const route of routes) {
      console.log(`--- SWAP ROUTE ${routes.indexOf(route) + 1} ---`)
      console.log('🚀 ~ useExecuteSwap ~ route:', route)
      console.log('🚀 ~ useExecuteSwap ~ input amount of route:', route.inputAmount.toExact())
      console.log('🚀 ~ useExecuteSwap ~ output amount of route:', route.outputAmount.toExact())
      console.log('🚀 ~ useExecuteSwap ~ path:', route.path)
      console.log(`🚀 ~ Handle single hop: ${route.path.length === 2 && route.pools.length === 1}`)
      console.log(`🚀 ~ Handle multi-hop: ${route.path.length > 2 || route.pools.length > 1}`)

      // Check if we have valid path and pools
      if (!route.path || !route.pools || route.path.length < 2 || route.pools.length !== route.path.length - 1) {
        console.error('Invalid route structure:', route)
        throw new Error('Invalid route: path and pools mismatch')
      }

      // Nếu đầu ra là đồng native, thì gửi native đến hợp đồng SwapRouter, sau đó chuyển tiếp đến ví của user
      const recipient = outputTokenIsNative ? contractSwapRouterV3 : address.value
      const deadline = Math.floor(Date.now() / 1000) + 20 * 60 // 20 minutes

      let encodedData: `0x${string}`

      // Handle direct (single hop) routes
      if (route.path.length === 2 && route.pools.length === 1) {
        // Check if the route has a V3Pool
        const firstPool = route.pools[0]
        let sqrtPriceLimitX96 = BigInt(0)

        // Only calculate sqrtPriceLimitX96 if we have a V3Pool with necessary properties
        if ('liquidity' in firstPool && 'sqrtRatioX96' in firstPool) {
          const liquidity = firstPool.liquidity.toString()
          const sqrtRatioX96 = firstPool.sqrtRatioX96
          const currentPrice = new Decimal(sqrtRatioX96.toString()).div(new Decimal(2).pow(96)).pow(2)

          // Check if tokens have the sortsBefore method
          const zeroToOne =
            typeof route.path[0].wrapped?.sortsBefore === 'function'
              ? route.path[0].wrapped.sortsBefore(route.path[1].wrapped)
              : route.path[0].wrapped.address.toLowerCase() < route.path[1].wrapped.address.toLowerCase()

          let nextPrice: Decimal = new Decimal(0)

          if (zeroToOne) {
            nextPrice = new Decimal(liquidity).div(new Decimal(liquidity).div(currentPrice.sqrt()).add(trade.inputAmount.numerator.toString())).pow(2)
          } else {
            nextPrice = new Decimal(trade.inputAmount.numerator.toString()).div(new Decimal(liquidity)).add(currentPrice.sqrt()).pow(2)
          }

          sqrtPriceLimitX96 = BigInt(
            nextPrice
              .sqrt()
              .mul(2 ** 96)
              .toFixed(0)
          )
        }

        // Get addresses for wrapped tokens
        const tokenIn = route.inputAmount.currency.wrapped.address

        const tokenOut = route.outputAmount.currency.wrapped.address
        const amount = bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? route.inputAmount.numerator : route.outputAmount.numerator
        console.log('🚀 ~ useExecuteSwap ~ amount:', amount)
        const amountLimit =
          bestTrade.value?.tradeType === TradeType.EXACT_INPUT
            ? (route.outputAmount.numerator * BigInt(100 - Number(slippage.value))) / BigInt(100)
            : (route.inputAmount.numerator * BigInt(100 + Number(slippage.value))) / BigInt(100)

        const fee = (route.pools[0] as V3Pool).fee

        console.log('🚀 ~ useExecuteSwap ~ amountLimit:', amountLimit)
        const params = [tokenIn, tokenOut, fee, recipient, deadline, amount, amountLimit, sqrtPriceLimitX96]
        console.info(' (FormSwap.client.vue:398) params', params)

        encodedData = encodeFunctionData({
          abi: swapRouterABI,
          functionName: bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? 'exactInputSingle' : 'exactOutputSingle',
          args: [params]
        })
      }
      // Handle multi-hop routes
      else {
        const amountIn = BigInt(maximumAmountIn(createDynamicSlippagePercent(+slippage.value), route.inputAmount, bestTrade.value!.tradeType).quotient)
        console.log('🚀 ~ useExecuteSwap ~ amountIn:', amountIn)

        const amountOut = BigInt(minimumAmountOut(createDynamicSlippagePercent(+slippage.value), route.outputAmount, bestTrade.value!.tradeType).quotient)
        console.log('🚀 ~ useExecuteSwap ~ amountOut:', amountOut)
        // Extract token addresses from path
        const pathAddresses = route.path.map((token) => token.wrapped.address)
        console.log('🚀 ~ useExecuteSwap ~ pathAddresses:', pathAddresses)

        // Extract fees from pools
        const fees = route.pools.map((pool) => (pool as V3Pool).fee)
        console.log('🚀 ~ useExecuteSwap ~ fees:', fees)

        const path = encodePath(
          bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? pathAddresses : pathAddresses.reverse(),
          bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? fees : fees.reverse()
        )
        console.log('🚀 ~ useExecuteSwap ~ encode path:', path)

        const params = {
          path,
          recipient,
          deadline,
          ...(bestTrade.value?.tradeType === TradeType.EXACT_INPUT
            ? {
                amountIn: amountIn,
                amountOutMinimum: amountOut
              }
            : {
                amountOut: amountOut,
                amountInMaximum: amountIn
              })
        }

        encodedData = encodeFunctionData({
          abi: swapRouterABI,
          functionName: bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? 'exactInput' : 'exactOutput',
          args: [params]
        })
      }

      datas.push(encodedData)
    }

    // Handle native token unwrapping if needed
    if (outputTokenIsNative) {
      const unwrapData = encodeFunctionData({
        abi: swapRouterABI,
        functionName: 'unwrapWMON',
        args: [BigInt(0), address.value]
      })
      datas.push(unwrapData)
    }

    // Create multicall transaction
    const calldata = encodeFunctionData({
      abi: swapRouterABI,
      functionName: 'multicall',
      args: [datas]
    })
    console.log('🚀 ~ useExecuteSwap ~ calldata:', calldata)

    const isNative = form.value.token0.address === zeroAddress
    const inputAmount = Number(form.value.amountIn) * ((10 ** Number(form.value.token0.decimals)) as number)

    const gasLimit = await estimateGas(config, {
      to: contractSwapRouterV3,
      data: calldata,
      value: isNative ? BigInt(inputAmount) : hexToBigInt('0x0')
    }).catch((error) => {
      showToastMsg('Simulate transaction failed', 'error')
      throw error
    })

    console.log('🚀 ~ useExecuteSwap ~ gasLimit:', gasLimit)

    // Send transaction
    const txHash = await sendTransaction(config, {
      to: contractSwapRouterV3,
      data: calldata,
      value: isNative ? BigInt(inputAmount) : hexToBigInt('0x0'),
      gas: BigInt(gasLimit) + BigInt(Math.floor((Number(gasLimit) * 20) / 100)) // increase 20% gas limit
    })

    // Wait for transaction confirmation
    const { status } = await waitForTransactionReceipt(config, {
      chainId: chainId.value,
      hash: txHash,
      pollingInterval: 2000
    })

    if (status === 'success') {
      await postTx(txHash, contractSwapRouterV3)
      showToastMsg('Swap successful', 'success', getUrlScan(chainId.value, 'tx', txHash), chainId.value)
      console.info('Transaction successful', 'success', txHash)
    } else {
      ElMessage.error('Transaction failed')
      console.info('Transaction failed', 'error', txHash)
    }
  }

  // const _useExactInputMulticall = async (swapOut: SmartRouterTrade<TradeType>) => {
  //   const trade = swapOut
  //   console.info(' (FormSwap.client.vue:355) trade', trade)
  //   const datas: Hex[] = []
  //   const outputTokenIsNative = form.value.token1.address === zeroAddress

  //   const contractSwapRouterV3 = getSwapRouterV3Address(chainId.value)
  //   if (!contractSwapRouterV3) throw new Error('Invalid contract address')

  //   for (const route of trade.routes) {
  //     console.log('🚀 ~ useExecuteSwap ~ route:', route)

  //     if (route.path.length < 2 || route.pools.length !== route.path.length - 1) {
  //       throw new Error('Invalid route: path and pools mismatch')
  //     }

  //     // Nếu đầu ra là đồng wnative, thì gửi wnative đến hợp đồng SwapRouter, sau đó chuyển tiếp đến ví của user
  //     // chứ không phải user, để router có thể unwrap sau đó
  //     const recipient = outputTokenIsNative ? contractSwapRouterV3 : address.value

  //     const deadline = Math.floor(Date.now() / 1000) + 5 * 60 // 5 minutes

  //     const amount = bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? route.inputAmount.numerator.toString() : route.outputAmount.numerator.toString()
  //     const amountLimit =
  //       bestTrade.value?.tradeType === TradeType.EXACT_INPUT
  //         ? Math.floor((Number(route.outputAmount.numerator) * (100 - Number(slippage.value))) / 100)
  //         : Math.floor((Number(route.inputAmount.numerator) * (100 + Number(slippage.value))) / 100)
  //     // Tính sqrtPriceLimitX96 dựa trên pool đầu tiên
  //     const firstPool = route.pools[0] as V3Pool
  //     const liquidity = firstPool.liquidity.toString()
  //     const sqrtRatioX96 = firstPool.sqrtRatioX96
  //     const currentPrice = new Decimal(sqrtRatioX96.toString()).div(new Decimal(2).pow(96)).pow(2)
  //     const zeroToOne = route.path[0].wrapped.sortsBefore(route.path[1].wrapped)
  //     let nextPrice: Decimal = new Decimal(0)

  //     if (zeroToOne) {
  //       nextPrice = new Decimal(liquidity).div(new Decimal(liquidity).div(currentPrice.sqrt()).add(trade.inputAmount.numerator.toString())).pow(2)
  //     } else {
  //       nextPrice = new Decimal(trade.inputAmount.numerator.toString()).div(new Decimal(liquidity)).add(currentPrice.sqrt()).pow(2)
  //     }
  //     const sqrtPriceLimitX96 = BigInt(
  //       nextPrice
  //         .sqrt()
  //         .mul(2 ** 96)
  //         .toFixed(0)
  //     )
  //     let encodedData: `0x${string}`
  //     if (route.path.length === 2 && route.pools.length === 1) {
  //       const tokenIn = route.inputAmount.currency.wrapped.address
  //       const tokenOut = route.outputAmount.currency.wrapped.address
  //       const fee = (route.pools[0] as V3Pool).fee

  //       // const swapRecipient = outputTokenIsNative ? contractSwapRouterV3 : recipient

  //       const params = [tokenIn, tokenOut, fee, recipient, deadline, BigInt(amount), BigInt(amountLimit), sqrtPriceLimitX96]
  //       console.info(' (FormSwap.client.vue:398) params', params)

  //       encodedData = encodeFunctionData({
  //         abi: swapRouterABI,
  //         functionName: bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? 'exactInputSingle' : 'exactOutputSingle',
  //         args: [params]
  //       })
  //     } else {
  //       // const swapRecipient = outputTokenIsNative ? contractSwapRouterV3 : recipient

  //       const path = encodePath(
  //         route.path.map((token) => token.wrapped.address),
  //         route.pools.map((pool) => (pool as V3Pool).fee)
  //       )

  //       const params = {
  //         path,
  //         recipient,
  //         deadline,
  //         ...(bestTrade.value?.tradeType === TradeType.EXACT_INPUT
  //           ? {
  //               amountIn: BigInt(amount),
  //               amountOutMinimum: BigInt(amountLimit)
  //             }
  //           : {
  //               amountOut: BigInt(amount),
  //               amountInMaximum: BigInt(amountLimit)
  //             })
  //       }

  //       encodedData = encodeFunctionData({
  //         abi: swapRouterABI,
  //         functionName: bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? 'exactInput' : 'exactOutput',
  //         args: [params]
  //       })
  //     }

  //     datas.push(encodedData)
  //   }

  //   if (outputTokenIsNative) {
  //     // Đặt amountMinimum là 0 và recipient là address của user
  //     // Để đảm bảo tất cả WMON được unwrap và gửi đến user
  //     const unwrapData = encodeFunctionData({
  //       abi: swapRouterABI,
  //       functionName: 'unwrapWMON',
  //       args: [BigInt(0), address.value]
  //     })
  //     datas.push(unwrapData)
  //   }

  //   const calldata = encodeFunctionData({
  //     abi: swapRouterABI,
  //     functionName: 'multicall',
  //     args: [datas]
  //   })
  //   console.log('🚀 ~ useExecuteSwap ~ calldata:', calldata)

  //   const isNative = form.value.token0.address === zeroAddress
  //   const inputAmount = Number(form.value.amountIn) * ((10 ** Number(form.value.token0.decimals)) as number)

  //   const txHash = await sendTransaction(config, {
  //     to: contractSwapRouterV3,
  //     data: calldata,
  //     value: isNative ? BigInt(inputAmount) : hexToBigInt('0x0'),
  //     gas: BigInt(20 * 10 ** 6)
  //   })

  //   const { status } = await waitForTransactionReceipt(config, {
  //     chainId: chainId.value,
  //     hash: txHash,
  //     pollingInterval: 2000
  //   })

  //   if (status === 'success') {
  //     const { showToastMsg } = useShowToastMsg()
  //     showToastMsg('Swap successful', 'success', getUrlScan(chainId.value, 'tx', txHash), chainId.value)
  //     await postTx(txHash, contractSwapRouterV3)
  //     console.info('Transaction successful', 'success', txHash)
  //   } else {
  //     ElMessage.error('Transaction failed')
  //     console.info('Transaction failed', 'error', txHash)
  //   }
  // }

  const handleSwap = async () => {
    try {
      // if (isDisabledButton.value) return
      // step 1: next step 2
      if (stepSwap.value === 'SELECT_TOKEN') {
        stepSwap.value = 'CONFIRM_SWAP'
        return
      }
      // step 2: approve
      if (token0IsToken.value) {
        if (isNeedAllowance0.value) {
          isConfirmApprove.value = true
          const contractSwapRouterV3 = getSwapRouterV3Address(chainId.value)!
          await approveToken(token0.value?.wrapped.address as string, contractSwapRouterV3, MAX_NUMBER_APPROVE, (status) => {
            if (status === 'SUCCESS') {
              refetchAllowance0()
              swap()
            }
          })
        } else {
          // step 3: swap
          console.info('STEP 3 ')
          await swap()
        }
      } else {
        // step 3: swap
        console.info('STEP 3 ')
        await swap()
      }
    } catch (error) {
      console.log('🚀 ~ handleSwap ~ error:', error)
    }
  }

  const { approveToken } = useApproveToken()

  const isNeedAllowance0 = computed(() => {
    const allowance = new Decimal(allowance0.value?.toString() || '0').div(10 ** +form.value.token0.decimals)
    return allowance0.value === BigInt(0) || allowance.lessThan(form.value.amountIn || 0)
  })

  const swap = async () => {
    try {
      isConfirmApprove.value = false
      isSwapping.value = true
      await useExecuteSwap(bestTrade.value as SwapOutput)
      isSwapping.value = false
      stepSwap.value = 'SELECT_TOKEN'
      form.value.amountIn = ''
      form.value.amountOut = ''
      form.value.tradingFee = '0'
      refetchBalance0()
      refetchBalance1()
    } catch (error) {
      console.log('🚀 ~ swap ~ error:', error)
      // console.info(' (FormSwap.client.vue:319) sign sao sao sao saii  xong r ne')
      isConfirmSwap.value = false
      isSwapping.value = false
    }
  }
  async function postTx(txHash: string, toAddress: string) {
    const inputAmount = Number(form.value.amountIn) * ((10 ** Number(form.value.token0.decimals)) as number)

    const body: IBodyTxCollect = {
      transactionHash: txHash,
      amount: inputAmount,
      feeAmount: Number(form.value.tradingFee ?? 0),
      fromAddress: address.value,
      toAddress,
      fromToken: token0.value?.wrapped.address,
      toToken: token1.value?.wrapped.address,
      transactionType: 'SWAP',
      network: currentNetwork.value.network,
      poolAddress: poolAddress.value
    }
    await postTransaction(body)
  }

  const { handleImageError } = useErrorImage()

  const handleChangeSlippage = () => {
    if (currentTypeInput.value === 'BASE') {
      form.value.minimumAmountOut = toSignificant((Number(form.value.amountOut) * (100 - Number(slippage.value))) / 100, 6)
    } else {
      form.value.maximumAmountIn = toSignificant((Number(form.value.amountIn) * (100 + Number(slippage.value))) / 100, 6)
    }
  }
</script>

<style scoped lang="scss">
  :deep(.popper-hover-fee) {
    --el-popover-border-radius: 9px;
    --el-popover-padding: 12px 24px 16px;
  }
</style>

<style lang="scss">
  .notify-swap {
    padding: 16px;
    border-radius: 8px;
    .el-notification__group {
      margin: 0dvb;
    }
    .el-icon.el-notification__closeBtn {
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
      color: var(--color-primary);
    }
  }
</style>
