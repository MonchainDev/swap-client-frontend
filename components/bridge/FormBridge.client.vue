<template>
  <div class="flex flex-col gap-2 rounded-lg bg-white px-8 pb-9 pt-[21px] shadow-md sm:gap-0 sm:p-4">
    <span class="text-2xl font-semibold leading-7 sm:text-lg"> Bridge </span>
    <span class="text-sm text-gray-8 sm:text-xs">Connects assets across blockchain networks seamlessly.</span>
    <div v-if="!approveAndSend" class="relative mt-6 flex w-full justify-between gap-1 sm:mt-5">
      <div class="from-network w-1/2">
        <ChooseNetworkBridge type="FROM" />
      </div>
      <!-- <InputBridge
        :is-selected="isToken0Selected"
        :token="form.token0"
        :balance="balance0?.formatted"
        :step-bridge
        type="BASE"
        class="h-[138px] w-1/2 bg-[#EFEFFF] sm:h-[120px]"
        @select-token="handleOpenChooseNetwork"
        @change="handleInput"
      /> -->
      <div class="relative z-10 select-none">
        <div
          class="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-[4px] border-solid border-white bg-[#1573FE] p-2 sm:size-9"
          @click="handleSwapOrder"
        >
          <BaseIcon name="bridge" class="text-white" :size="isDesktop ? '24' : '18'" />
        </div>
      </div>
      <div class="to-network w-1/2">
        <ChooseNetworkBridge type="TO" />
      </div>
      <!-- <InputBridge
        :is-selected="isToken1Selected"
        :token="form.token1"
        :balance="balance1?.formatted"
        :step-bridge
        type="QUOTE"
        class="h-[138px] w-1/2 bg-[#EFEFFF] sm:h-[120px]"
        @select-token="handleOpenChooseNetwork"
        @change="handleInput"
      /> -->
      <!-- <template v-else>
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
              <span class="text-sm font-semibold text-gray-6">≈ $150.6</span>
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
      </template> -->
    </div>
    <div v-if="!approveAndSend" class="mt-3 w-full sm:mt-4">
      <InputBridge
        v-model:amount="form.amount"
        :is-selected="isToken2Selected"
        :token="form.token2"
        :balance="balance2?.formatted"
        :step-bridge
        type="SEND"
        class="h-[138px] w-full border border-[#EEEEEE] bg-white sm:h-[100px]"
        @select-token="handleOpenPopupSelectToken"
        @change="handleInput"
      />
    </div>

    <div v-if="approveAndSend" class="mt-6 w-full sm:mt-5">
      <div class="flex w-full rounded-tl-lg rounded-tr-lg bg-[#FAFAFA] px-8 pb-7 pt-3 shadow sm:px-3 sm:pb-5">
        <div class="flex flex-col">
          <p class="mb-4 text-sm text-primary sm:mb-2 sm:text-xs">From network</p>
          <div class="flex items-center gap-2 rounded-lg">
            <img :src="fromNetwork?.logo" alt="logo" class="size-7 rounded-lg sm:size-5" />
            <span class="overflow-hidden text-ellipsis text-base font-semibold sm:text-xs">
              {{ fromNetwork?.title }}
            </span>
          </div>
        </div>
        <BaseIcon v-if="isDesktop" name="arrow-line-horizontal" size="116" class="arrow-horizontal mx-4 max-h-8" />
        <BaseIcon v-else name="arrow-line-horizontal-mobile" size="48" class="arrow-horizontal mx-3 max-h-8" />
        <div class="flex flex-col">
          <p class="mb-4 text-sm text-primary sm:mb-2 sm:text-xs">To network</p>
          <div class="flex items-center gap-2 rounded-lg">
            <img :src="fromNetwork?.logo" alt="logo" class="size-7 rounded-lg sm:size-5" />
            <span class="overflow-hidden text-ellipsis text-base font-semibold sm:text-xs">
              {{ fromNetwork?.title }}
            </span>
          </div>
        </div>
      </div>
      <div class="w-full rounded-bl-lg rounded-br-lg border-t border-[#EEEEEE] bg-[#FAFAFA] px-8 pb-7 pt-3 shadow sm:px-3 sm:pb-5">
        <div class="flex flex-col">
          <p class="mb-1 text-primary sm:mb-2 sm:text-sm">Send</p>
          <div class="flex items-center justify-between gap-2 rounded-lg bg-[#FAFAFA]">
            <div class="flex items-center gap-1">
              <img :src="form.token2.icon_url" alt="logo" class="size-7 rounded-lg sm:size-5" />
              <p class="overflow-hidden text-ellipsis text-[22px] font-semibold leading-[28px] sm:text-base">
                {{ form.token2.symbol }}
              </p>
            </div>
            <div class="flex flex-col">
              <p class="text-[32px] font-semibold leading-[28px] text-primary sm:text-[22px]">15</p>
              <p class="text-sm font-semibold text-gray-6">≈ 0.02</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3 w-full rounded-lg border border-dashed border-gray-4 px-8 py-4 sm:mt-4 sm:px-4 sm:pt-3">
      <div class="flex justify-between">
        <span class="text-sm text-primary"> You Receive </span>
        <div class="flex flex-col gap-1 text-right">
          <p class="receive">0.0</p>
          <div class="flex items-center gap-1">
            <img src="/public/logo.png" alt="logo" class="size-4 rounded-full" />
            <span class="line-clamp-1 text-xs text-[#6F6A79]">(0x4612...A707)</span>
          </div>
        </div>
      </div>
      <div class="mt-5 flex justify-between">
        <span class="text-sm text-primary"> Est. time </span>
        <span class="text-sm font-medium text-primary"> ≈ 12 seconds </span>
      </div>
      <div class="mt-3 flex justify-between">
        <span class="text-sm text-primary"> Fee </span>
        <div class="text-end text-sm font-medium text-primary">
          <span>0.0595 BNB</span> + <span>0.00001 ETH</span> +
          <el-tooltip popper-class="tooltip-fee-bridge" append-to="body" placement="top-end" effect="light">
            <template #content>
              <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                  <span class="text-sm text-[#6E6E6E]">Protocol Fee</span>
                  <span class="text-sm text-[#1C1C1C]">0.150001 BNB</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-[#6E6E6E]">deBridge Fee</span>
                  <span class="text-sm text-[#1C1C1C]">0.00005272 ETH</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-[#6E6E6E]">Market Maker Gas</span>
                  <span class="text-sm text-[#1C1C1C]">12300.00005272</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-[#6E6E6E]">Cost</span>
                  <span class="text-sm text-[#1C1C1C]">ATOM</span>
                </div>
              </div>
            </template>
            <span class="border-b border-dashed border-gray-4">140.0 ATOM</span>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- <template v-if="isQuoteExist">
      <InfoSwap v-model:edit-slippage="isEditSlippage" :step-swap />
    </template> -->

    <template v-if="!isEditSlippage">
      <button
        v-if="isConnected"
        :disabled="isDisabledButton"
        class="bg-linear mt-3 flex h-[67px] items-center justify-center gap-2 rounded-lg text-xl font-semibold text-white hover:opacity-90 sm:mt-4 sm:h-[42px] sm:text-sm"
        :class="{ 'bg-gray pointer-events-none cursor-default': isSwapping || isConfirmApprove || isConfirmSwap, 'btn-disabled': isDisabledButton }"
        @click="handleBridge"
      >
        <BaseLoadingButton v-if="isFetchQuote || isSwapping || isConfirmApprove || isConfirmSwap" />
        <span>{{ msgButton }}</span>
      </button>
      <button
        v-else
        class="bg-linear mt-3 flex h-[67px] items-center justify-center gap-2 rounded-lg text-xl font-semibold text-white hover:opacity-90 sm:mt-4 sm:h-[42px] sm:text-sm"
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

    <PopupSellToken @select="handleSelectToken" />
  </div>
</template>

<script lang="ts" setup>
  // import { type SmartRouterTrade, type V3Pool } from '@monchain/smart-router'
  // import { TradeType } from '@monchain/swap-sdk-core'
  // import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import { useAccount } from '@wagmi/vue'
  // import Decimal from 'decimal.js'
  // import { encodeFunctionData, hexToBigInt, type Hex } from 'viem'
  // import { config } from '~/config/wagmi'
  import { DEFAULT_SLIPPAGE } from '~/constant'
  // import swapRouterABI from '~/constant/abi/swapRouter.json'
  // import { CONTRACT_ADDRESS, MAX_NUMBER_APPROVE } from '~/constant/contract'
  import type { IToken } from '~/types'
  import type { TYPE_BRIDGE } from '~/types/bridge.type'
  // import { type SwapOutput } from '~/utils/getBestTrade'
  import InputBridge from './InputBridge.vue'
  import ChooseNetworkBridge from './ChooseNetworkBridge.vue'
  import PopupSellToken from '../popup/PopupSellToken.vue'
  // import HeaderFormSwap from './HeaderFormSwap.vue'
  // import { SwapRouter, type SwapOptions } from '~/composables/swapRouter'
  export type StepBridge = 'SELECT_TOKEN' | 'CONFIRM_BRIDGE'

  interface IProps {
    title?: string
  }

  const _props = withDefaults(defineProps<IProps>(), {
    title: 'Swap'
  })

  const approveAndSend = ref<boolean>(false)
  const { fromNetwork, toNetwork } = storeToRefs(useBridgeStore())
  const { isConnected } = useAccount()
  const { setOpenPopup } = useBaseStore()
  const { isDesktop } = storeToRefs(useBaseStore())
  const { isSwapping, isConfirmApprove, slippage, isConfirmSwap, balance2, form } = storeToRefs(useBridgeStore())

  const isEditSlippage = ref(false)
  const stepBridge = ref<StepBridge>('SELECT_TOKEN')
  // const sendAmount = ref('')
  // const sellAmount = ref('')

  // const trades = ref<SmartRouterTrade<TradeType>>()

  // const bestTrade = ref<SwapOutput | undefined>(undefined)

  const isFetchQuote = ref(false)

  // const isToken0Selected = computed(() => form.value.token0.symbol !== '')
  // const isToken1Selected = computed(() => form.value.token1.symbol !== '')
  const isToken2Selected = computed(() => form.value.token2?.symbol !== '')
  // const isQuoteExist = computed(() => form.value.amountOut && form.value.amountIn)
  // const formatTitle = computed(() => {
  //   return stepBridge.value === 'SELECT_TOKEN' ? _props.title : 'Confirm swap'
  // })

  // const noRoute = computed(() => !(((bestTrade.value && bestTrade.value?.routes.length) ?? 0) > 0))
  const notEnoughLiquidity = ref(false)

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
    return 'Enter an amount'
    // if (isSwapping.value) {
    //   return 'SWAPPING! PLEASE WAIT..'
    // } else if (!isToken0Selected.value || !isToken1Selected.value) {
    //   return 'Select a token'
    // } else if (isFetchQuote.value) {
    //   return 'Finalizing quote...'
    // } else if ((!isFetchQuote.value && noRoute.value && isToken0Selected.value && isToken1Selected.value) || notEnoughLiquidity.value) {
    //   return 'Insufficient liquidity for this trade'
    // } else if (isToken0Selected.value && isToken1Selected.value) {
    //   if (stepBridge.value === 'SELECT_TOKEN') {
    //     return `Swap ${bestTrade.value?.inputAmount.toSignificant(6)} ${form.value.token0.symbol} ⇒ ${bestTrade.value?.outputAmount.toSignificant(6)} ${form.value.token1.symbol}`
    //   } else {
    //     if (isSwapping.value) {
    //       return 'SWAPPING! PLEASE WAIT..'
    //     } else {
    //       return isConfirmApprove.value || isConfirmSwap.value ? 'CONFIRM IN WALLET' : 'APPROVE AND SWAP'
    //     }
    //   }
    // } else {
    //   return 'Enter an amount'
    // }
  })

  const isDisabledButton = computed(() => {
    return false
    // return (
    //   !isToken2Selected.value ||
    //   !form.value.amount ||
    //   !(fromNetwork.value.value === toNetwork.value.value) ||
    //   isFetchQuote.value ||
    //   noRoute.value ||
    //   notEnoughLiquidity.value
    // )
  })

  const handleSwapOrder = () => {
    if (fromNetwork.value.value === toNetwork.value.value) return
    ;[fromNetwork.value, toNetwork.value] = [toNetwork.value, fromNetwork.value]
    // if (stepBridge.value === 'CONFIRM_BRIDGE') return
    // ;[form.value.token0, form.value.token1] = [form.value.token1, form.value.token0]
    // handleInput(form.value.amountIn, 'BASE')
  }

  const typeOpenPopup = ref<TYPE_BRIDGE>('BASE')
  const handleOpenPopupSelectToken = (type: TYPE_BRIDGE) => {
    if (stepBridge.value === 'CONFIRM_BRIDGE') return
    typeOpenPopup.value = type
    setOpenPopup('popup-sell-token', true)
  }

  const handleInput = async (amount: string, type: TYPE_BRIDGE) => {
    try {
      notEnoughLiquidity.value = false
      // if (!isToken0Selected.value || !isToken1Selected.value) return
      isFetchQuote.value = true
      if (!amount) {
        isFetchQuote.value = false
        // form.value.amountOut = ''
        // form.value.amountIn = ''
        isEditSlippage.value = false
        slippage.value = DEFAULT_SLIPPAGE
        return
      }

      if (type === 'SEND') {
        form.value.amount = amount
        // const inputAmount = Number(form.value.amount) * ((10 ** Number(form.value.token2.decimals)) as number)
        // sendAmount.value = Number(amount) > 0 ? (Math.random() * 1000).toFixed(3) + '' : ''
        // const _bestTrade = await getBestTrade({
        //   token0: form.value.token0.address,
        //   token1: form.value.token1.address,
        //   inputAmount: inputAmount,
        //   type: TradeType.EXACT_INPUT
        // })
        // bestTrade.value = _bestTrade
        // form.value.amountOut = bestTrade.value.outputAmount.toSignificant(6)
        // form.value.tradingFee = bestTrade.value.tradingFee
        // form.value.minimumAmountOut = bestTrade.value.minimumAmountOut?.toSignificant(6)
        // form.value.maximumAmountIn = ''
        // form.value.priceImpact = bestTrade.value.priceImpact.toFixed()
        isFetchQuote.value = false
      }

      // if (type === 'BASE') {
      // form.value.amountIn = amount
      // form.value.amountOut = ''
      // console.log('🚀 ~ handleInput ~ form.value.amountIn:', form.value.amountIn)
      // const inputAmount = Number(form.value.amountIn) * ((10 ** Number(form.value.token0.decimals)) as number)
      // console.log('🚀 ~ handleInput ~ inputAmount', inputAmount)
      // buyAmount.value = Number(amount) > 0 ? (Math.random() * 1000).toFixed(3) + '' : ''
      // const _bestTrade = await getBestTrade({
      //   token0: form.value.token0.address,
      //   token1: form.value.token1.address,
      //   inputAmount: inputAmount,
      //   type: TradeType.EXACT_INPUT
      // })
      // bestTrade.value = _bestTrade
      // form.value.amountOut = bestTrade.value.outputAmount.toSignificant(6)
      // form.value.tradingFee = bestTrade.value.tradingFee
      // form.value.minimumAmountOut = bestTrade.value.minimumAmountOut?.toSignificant(6)
      // form.value.maximumAmountIn = ''
      // form.value.priceImpact = bestTrade.value.priceImpact.toFixed()
      // isFetchQuote.value = false
      // } else {
      // form.value.amountOut = amount
      // form.value.amountIn = ''
      // const inputAmount = Number(form.value.amountOut) * ((10 ** Number(form.value.token1.decimals)) as number)
      // const _bestTrade = await getBestTrade({
      //   token0: form.value.token0.address,
      //   token1: form.value.token1.address,
      //   inputAmount: inputAmount,
      //   type: TradeType.EXACT_OUTPUT
      // })
      // bestTrade.value = _bestTrade
      // form.value.amountIn = bestTrade.value.inputAmount.toSignificant(6)
      // form.value.tradingFee = bestTrade.value.tradingFee
      // form.value.maximumAmountIn = bestTrade.value?.maximumAmountIn?.toSignificant(6)
      // form.value.minimumAmountOut = ''
      // form.value.priceImpact = bestTrade.value.priceImpact.toFixed()
      // form.value.fee = _bestTrade.fee
      // }
      isFetchQuote.value = false
    } catch (_error) {
      console.error('🚀 ~ handleInput ~ _error:', _error)
      isFetchQuote.value = false
      notEnoughLiquidity.value = true
    }
  }

  const handleSelectToken = (token: IToken) => {
    // if (typeOpenPopup.value === 'BASE') {
    //   form.value.token0 = token
    //   if (token.address === form.value.token1.address) {
    //     form.value.token1 = { name: '', symbol: '', decimals: 0, icon_url: '', address: '' }
    //     // form.value.amountIn = ''
    //   }
    // }
    // if (typeOpenPopup.value === 'QUOTE') {
    //   form.value.token1 = token
    //   form.value.token0 = token.address === form.value.token0.address ? { address: '', decimals: '', icon_url: '', name: '', symbol: '' } : form.value.token0
    //   if (token.address === form.value.token0.address) {
    //     form.value.token0 = { name: '', symbol: '', decimals: 0, icon_url: '', address: '' }
    //     // form.value.amountOut = ''
    //   }
    // }

    if (typeOpenPopup.value === 'SEND') {
      form.value.token2 = token
      // form.value.token0 = token.address === form.value.token0.address ? { address: '', decimals: '', icon_url: '', name: '', symbol: '' } : form.value.token0
      // if (token.address === form.value.token0.address) {
      //   form.value.token0 = { name: '', symbol: '', decimals: 0, icon_url: '', address: '' }
      //   form.value.amountOut = ''
      // }
    }

    // if (isToken0Selected.value && isToken1Selected.value) {
    //   if ((form.value.amountIn && !form.value.amountOut) || (form.value.amountIn && form.value.amountOut)) {
    //     handleInput(form.value.amountIn, 'BASE')
    //   } else if (!form.value.amountIn && form.value.amountOut) {
    //     handleInput(form.value.amountOut, 'QUOTE')
    //   }
    // }
  }

  // const token0IsToken = computed(() => form.value.token0.address !== '')

  // const useExactInputMulticall = async (swapOut: SwapOutput) => {
  //   const trade = swapOut as SmartRouterTrade<TradeType>
  //   const datas: Hex[] = []

  //   for (const route of trade.routes) {
  //     const tokenIn = route.path[0].wrapped.address
  //     const tokenOut = route.path[1].wrapped.address
  //     const liquidity = (route.pools[0] as V3Pool).liquidity.toString()
  //     const sqrtRatioX96 = (route.pools[0] as V3Pool).sqrtRatioX96
  //     const currentPrice = new Decimal(sqrtRatioX96.toString()).div(new Decimal(2).pow(96)).pow(2)

  //     const zeroToOne = route.path[0].wrapped.sortsBefore(route.path[1].wrapped)
  //     let nextPrice: Decimal = new Decimal(0)
  //     if (zeroToOne) {
  //       // √(Pnew) = L / ( (L/√(Pcurrent)) + Δx )
  //       nextPrice = new Decimal(liquidity).div(new Decimal(liquidity).div(currentPrice.sqrt()).add(trade.inputAmount.numerator.toString())).pow(2)
  //     } else {
  //       // √(Pnew) = (Δy / L) + √(Pcurrent)
  //       nextPrice = new Decimal(trade.inputAmount.numerator.toString()).div(new Decimal(liquidity)).add(currentPrice.sqrt()).pow(2)
  //     }
  //     const sqrtPriceLimitX96 = nextPrice
  //       .sqrt()
  //       .mul(2 ** 96)
  //       .toNumber()

  //     const fee = (route.pools[0] as V3Pool).fee
  //     const recipient = address.value
  //     const deadline = Math.floor(Date.now() / 1000) + 5 * 60 // 5 minutes
  //     const amount = bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? route.inputAmount.numerator : route.outputAmount.numerator
  //     const amountLimit =
  //       bestTrade.value?.tradeType === TradeType.EXACT_INPUT
  //         ? Math.floor((Number(route.outputAmount.numerator) * (100 - Number(slippage.value))) / 100)
  //         : Math.floor((Number(route.inputAmount.numerator) * (100 + Number(slippage.value))) / 100)
  //     const params = [tokenIn, tokenOut, fee, recipient, deadline, amount, amountLimit, sqrtPriceLimitX96]
  //     const encodedData = encodeFunctionData({
  //       abi: swapRouterABI,
  //       functionName: bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? 'exactInputSingle' : 'exactOutputSingle',
  //       args: [params]
  //     })

  //     datas.push(encodedData)
  //   }

  //   const calldata = encodeFunctionData({
  //     abi: swapRouterABI,
  //     functionName: 'multicall',
  //     args: [datas]
  //   })

  //   const txHash = await sendTransaction(config, {
  //     to: CONTRACT_ADDRESS.SWAP_ROUTER_V3 as `0x${string}`,
  //     data: calldata,
  //     value: hexToBigInt('0x0')
  //   })

  //   const { status } = await waitForTransactionReceipt(config, {
  //     hash: txHash,

  //     pollingInterval: 2000
  //   })

  //   if (status === 'success') {
  //     const { showToastMsg } = useShowToastMsg()
  //     showToastMsg('Swap successful', 'success', txHash)
  //     console.info('Transaction successful', 'success', txHash)
  //   } else {
  //     ElMessage.error('Transaction failed')
  //     console.info('Transaction failed', 'error', txHash)
  //   }
  // }

  const handleBridge = async () => {
    approveAndSend.value = !approveAndSend.value
    // try {
    //   if (isDisabledButton.value) return
    //   // step 1: next step 2
    //   if (stepBridge.value === 'SELECT_TOKEN') {
    //     stepBridge.value = 'CONFIRM_BRIDGE'
    //     return
    //   }
    //   // step 2: approve
    //   if (token0IsToken.value) {
    //     if (isNeedAllowance0.value) {
    //       await approveToken(form.value.token0.address as string, CONTRACT_ADDRESS.SWAP_ROUTER_V3, MAX_NUMBER_APPROVE, (status) => {
    //         if (status === 'SUCCESS') {
    //           swap()
    //         }
    //         isConfirmApprove.value = false
    //       })
    //     } else {
    //       // step 3: swap
    //       console.info('STEP 3 ')
    //       await swap()
    //     }
    //   } else {
    //     // step 3: swap
    //     console.info('STEP 3 ')
    //     await swap()
    //   }
    // } catch (error) {
    //   console.log('🚀 ~ handleBridge ~ error:', error)
    // }
  }

  // const { approveToken } = useApproveToken()

  // const isNeedAllowance0 = computed(() => {
  //   const allowance = new Decimal(allowance0.value?.toString() || '0').div(10 ** +form.value.token0.decimals)
  //   return allowance0.value === BigInt(0) || allowance.lessThan(0)
  // })

  // const swap = async () => {
  //   try {
  //     isConfirmApprove.value = false
  //     isSwapping.value = true
  //     await useExactInputMulticall(bestTrade.value as SwapOutput)
  //     isSwapping.value = false
  //     stepBridge.value = 'SELECT_TOKEN'
  //     // form.value.amountIn = ''
  //     // form.value.amountOut = ''
  //     form.value.tradingFee = 0
  //   } catch (error) {
  //     console.log('🚀 ~ swap ~ error:', error)
  //     console.info(' (FormSwap.client.vue:319) sign sao sao sao saii  xong r ne')
  //     isConfirmSwap.value = false
  //     isSwapping.value = false
  //     el1?.close()
  //   }
  // }

  // const el1: ReturnType<typeof ElNotification> | null = null

  // const { handleImageError } = useErrorImage()
</script>

<style scoped lang="scss">
  :deep(.popper-hover-fee) {
    --el-popover-border-radius: 9px;
    --el-popover-padding: 12px 24px 16px;
  }
  .receive {
    height: 28px;
    font-size: 22px;
    font-weight: 600;
    text-align: right;
    background: linear-gradient(91deg, #790c8b 60%, #1573fe 98%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    overflow: hidden;
  }
  :deep(.arrow-horizontal) {
    svg {
      @apply mt-11 !h-[unset] !w-[unset] sm:mt-7;
    }
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
  .tooltip-fee-bridge {
    @apply min-w-[320px] rounded-lg px-6 py-3;
  }
</style>
