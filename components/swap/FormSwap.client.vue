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
      </template>
    </div>

    <template v-if="isQuoteExist">
      <InfoSwap v-model:edit-slippage="isEditSlippage" :step-swap />
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
  import ROUTER_V3_ABI from '@/constant/abi/swapRouter.json'
  import type { SmartRouterTrade } from '@monchain/smart-router'
  import { TradeType } from '@monchain/swap-sdk-core'
  import { waitForTransactionReceipt, writeContract } from '@wagmi/core'
  import { useAccount } from '@wagmi/vue'
  import Decimal from 'decimal.js'
  import { config } from '~/config/wagmi'
  import { DEFAULT_SLIPPAGE } from '~/constant'
  import { CONTRACT_ADDRESS, MAX_NUMBER_APPROVE } from '~/constant/contract'
  import type { IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'
  import { getBestTrade, type SwapOutput } from '~/utils/getBestTrade'
  import HeaderFormSwap from './HeaderFormSwap.vue'

  export type StepSwap = 'SELECT_TOKEN' | 'CONFIRM_SWAP'

  interface IProps {
    title?: string
  }

  const _props = withDefaults(defineProps<IProps>(), {
    title: 'Swap'
  })

  const { setOpenPopup } = useBaseStore()
  const { isDesktop } = storeToRefs(useBaseStore())

  const { isSwapping, isConfirmApprove, slippage, isConfirmSwap, allowance0, balance0, balance1, form } = storeToRefs(useSwapStore())

  const isEditSlippage = ref(false)
  const stepSwap = ref<StepSwap>('SELECT_TOKEN')
  // const buyAmount = ref('')
  // const sellAmount = ref('')

  // const trades = ref<SmartRouterTrade<TradeType>>()

  const bestTrade = ref<SwapOutput | undefined>(undefined)

  const isFetchQuote = ref(false)

  const isToken0Selected = computed(() => form.value.token0.symbol !== '')
  const isToken1Selected = computed(() => form.value.token1.symbol !== '')
  const isQuoteExist = computed(() => form.value.amountOut && form.value.amountIn)
  const formatTitle = computed(() => {
    return stepSwap.value === 'SELECT_TOKEN' ? _props.title : 'Confirm swap'
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
    } else if (isToken0Selected.value && isToken1Selected.value && form.value.amountOut && form.value.amountIn) {
      if (stepSwap.value === 'SELECT_TOKEN') {
        return `Swap ${form.value.amountIn} ${form.value.token0.symbol} ⇒ ${form.value.amountOut} ${form.value.token1.symbol}`
      } else {
        if (isSwapping.value) {
          return 'SWAPPING! PLEASE WAIT..'
        } else {
          return isConfirmApprove.value || isConfirmSwap.value ? 'CONFIRM IN WALLET' : 'APPROVE AND SWAP'
        }
      }
    } else {
      return 'Enter an amount'
    }
  })

  const isDisabledButton = computed(() => {
    return !isToken0Selected.value || !isToken1Selected.value || !form.value.amountOut || !form.value.amountOut || isFetchQuote.value
  })

  const handleSwapOrder = () => {
    if (stepSwap.value === 'CONFIRM_SWAP') return
    ;[form.value.token0, form.value.token1] = [form.value.token1, form.value.token0]
    handleInput(form.value.amountIn, 'BASE')
  }

  const typeOpenPopup = ref<TYPE_SWAP>('BASE')
  const handleOpenPopupSelectToken = (type: TYPE_SWAP) => {
    if (stepSwap.value === 'CONFIRM_SWAP') return
    typeOpenPopup.value = type
    setOpenPopup('popup-select-token', true)
  }

  const handleInput = async (amount: string, type: TYPE_SWAP) => {
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

    if (type === 'BASE') {
      // buyAmount.value = Number(amount) > 0 ? (Math.random() * 1000).toFixed(3) + '' : ''
      const _bestTrade = await getBestTrade({
        token0: form.value.token0.address,
        token1: form.value.token1.address,
        inputAmount: Number(form.value.amountIn),
        type: TradeType.EXACT_INPUT
      })
      bestTrade.value = _bestTrade
      form.value.amountOut = bestTrade.value.outputAmount.toExact()
      form.value.tradingFee = bestTrade.value.tradingFee
      form.value.minimumAmountOut = bestTrade.value.minimumAmountOut?.toExact()
      form.value.maximumAmountIn = ''
      form.value.priceImpact = bestTrade.value.priceImpact.toFixed()
      isFetchQuote.value = false
    } else {
      const _bestTrade = await getBestTrade({
        token0: form.value.token0.address,
        token1: form.value.token1.address,
        inputAmount: Number(form.value.amountIn),
        type: TradeType.EXACT_OUTPUT
      })
      bestTrade.value = _bestTrade
      form.value.amountIn = bestTrade.value.inputAmount.toExact()
      form.value.tradingFee = bestTrade.value.tradingFee
      form.value.maximumAmountIn = bestTrade.value?.maximumAmountIn?.toExact()
      form.value.minimumAmountOut = ''
      form.value.priceImpact = bestTrade.value.priceImpact.toFixed()
    }
    isFetchQuote.value = false
  }

  const handleSelectToken = (token: IToken) => {
    if (typeOpenPopup.value === 'BASE') {
      form.value.token0 = token
      if (token.address === form.value.token1.address) {
        form.value.token1 = { name: '', symbol: '', decimals: 0, icon_url: '', address: '' }
        form.value.amountIn = ''
      }
    } else {
      form.value.token1 = token
      form.value.token0 = token.address === form.value.token0.address ? { address: '', decimals: '', icon_url: '', name: '', symbol: '' } : form.value.token0
      if (token.address === form.value.token0.address) {
        form.value.token0 = { name: '', symbol: '', decimals: 0, icon_url: '', address: '' }
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

  const token0IsToken = computed(() => form.value.token0.address !== '')

  const handleSwap = async () => {
    try {
      // if (isDisabledButton.value) return
      console.info('toiw day r ne')
      console.info(' (FormSwap.client.vue:284) ', stepSwap.value)
      // step 1: next step 2
      if (stepSwap.value === 'SELECT_TOKEN') {
        console.info('STEP 1 ')
        stepSwap.value = 'CONFIRM_SWAP'
        return
      }
      // step 2: approve
      if (token0IsToken.value) {
        if (isNeedAllowance0.value) {
          console.info(' (FormSwap.client.vue:295) isNeedAllowance0', isNeedAllowance0)
          console.info('STEP 2 ')
          await approveToken(form.value.token0.address as string, CONTRACT_ADDRESS.SWAP_ROUTER_V3, MAX_NUMBER_APPROVE, (status) => {
            if (status === 'SUCCESS') {
              console.log('Approve success')
              swap()
            }
            isConfirmApprove.value = false
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
    console.info(' (FormSwap.client.vue:314) allowance0', allowance0)
    const allowance = new Decimal(allowance0.value?.toString() || '0').div(10 ** +form.value.token0.decimals)
    console.info(' (FormSwap.client.vue:314) allowance0', allowance0)
    return allowance0.value === BigInt(0) || allowance.lessThan(form.value.amountIn || 0)
  })

  // const { signMessageAsync } = useSignMessage()

  // const { exactInputSingle } = useExactInputSingle()
  const { showToastMsg } = useShowToastMsg()
  const swap = async () => {
    try {
      isConfirmApprove.value = false

      isSwapping.value = true
      console.log('🚀 ~ swap ~ bestTrade:', bestTrade.value)
      const amountOutMin = new Decimal(form.value.minimumAmountOut || 0).mul(10 ** +form.value.token1.decimals).toString()
      const amountIn = new Decimal(form.value.amountIn || 0).mul(10 ** +form.value.token0.decimals).toString()
      const deadline = Math.floor(Date.now() / 1000) + 5 * 60 // 5 minutes

      const params = {
        tokenIn: form.value.token0.address,
        tokenOut: form.value.token1.address,
        fee: 2500,
        recipient: address.value,
        deadline,
        amountIn: BigInt(amountIn),
        amountOutMinimum: BigInt(amountOutMin),
        sqrtPriceLimitX96: BigInt(0)
      }

      const hash = await writeContract(config, {
        address: CONTRACT_ADDRESS.SWAP_ROUTER_V3 as `0x${string}`,
        abi: ROUTER_V3_ABI,
        functionName: 'exactInputSingle',
        args: [params]
      })

      const { status } = await waitForTransactionReceipt(config, {
        hash,
        pollingInterval: 2000
      })
      if (status === 'success') {
        showToastMsg('Transaction receipt', 'success', hash)
      } else {
        showToastMsg('Transaction failed', 'error', hash)
      }
      isSwapping.value = false
      stepSwap.value = 'SELECT_TOKEN'
    } catch (error) {
      console.log('🚀 ~ swap ~ error:', error)
      console.info(' (FormSwap.client.vue:319) sign sao sao sao saii  xong r ne')
      isConfirmSwap.value = false
      isSwapping.value = false
      el1?.close()
    }
  }

  let el1: ReturnType<typeof ElNotification> | null = null
  const showNotify = (type: 'PENDING' | 'SUCCESS', msg: string) => {
    if (type === 'PENDING') {
      el1 = ElNotification({
        message: () =>
          h('div', { class: 'flex items-center gap-3' }, [
            h('div', { class: 'flex relative w-[54px]' }, [
              h('img', {
                src: form.value.token0.icon_url ? form.value.token0.icon_url : '/token-default.png',
                alt: form.value.token0.symbol,
                class: 'size-9 rounded-lg'
              }),
              h('img', {
                src: form.value.token1.icon_url ? form.value.token1.icon_url : '/token-default.png',
                alt: form.value.token1.symbol,
                class: 'size-9 rounded-lg absolute top-1/2 -translate-y-1/2 left-[18px]'
              })
            ]),
            h('div', { class: 'flex flex-col flex-1' }, [
              h('span', { class: 'text-sm text-primary font-medium' }, 'Swapping'),
              h('span', { class: 'text-xs text-gray-8' }, ` ${msg}`)
            ])
          ]),
        duration: 0,
        customClass: 'notify-swap',
        showClose: false,
        offset: 30
      })
    } else {
      setTimeout(() => {
        el1?.close()
      }, 2000)
      ElNotification({
        message: () =>
          h('div', { class: 'flex items-center gap-3' }, [
            h('img', { src: '/tick-success.png', alt: 'tick', class: 'size-10 ' }),
            h('div', { class: 'flex flex-col flex-1' }, [
              h('span', { class: 'text-sm text-[#049C6B] font-medium' }, 'Swapping successfully'),
              h('span', { class: 'text-xs text-gray-8 pr-5' }, ` ${msg}`)
            ])
          ]),
        duration: 5000,
        customClass: 'notify-swap',
        offset: 30
      })
    }
  }

  const { handleImageError } = useErrorImage()
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
