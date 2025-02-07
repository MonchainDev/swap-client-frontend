<template>
  <div class="flex flex-col gap-2 rounded-lg bg-white px-8 pb-10 pt-[21px] shadow-md sm:p-4">
    <HeaderFormSwap v-model:step-swap="stepSwap" :title="formatTitle" :is-confirm-approve="isConfirmApprove" :is-swapping="isSwapping" />
    <div class="relative mt-7 flex flex-col gap-1 sm:mt-[14px]">
      <InputSwap
        v-model:amount="sellAmount"
        :is-selected="isToken0Selected"
        :token="token0"
        :balance="balance0?.formatted"
        :step-swap
        type="BASE"
        class="bg-[#EFEFFF]"
        :class="{ 'bg-[#F5F5F5]': stepSwap === 'CONFIRM_SWAP' }"
        @select-token="handleOpenPopupSelectToken"
        @change="handleInput"
      />
      <div class="relative z-10 select-none">
        <div
          class="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-[4px] border-solid border-white bg-[#1573FE] p-2"
          :class="{ 'bg-gray-6': stepSwap === 'CONFIRM_SWAP' }"
          @click="handleSwapOrder"
        >
          <BaseIcon v-if="stepSwap === 'SELECT_TOKEN'" name="repeat" class="text-white" size="24" />
          <BaseIcon v-else name="arrow-down-bold" class="text-white" size="24" />
        </div>
      </div>
      <InputSwap
        v-model:amount="buyAmount"
        :is-selected="isToken1Selected"
        :token="token1"
        :balance="balance1?.formatted"
        :step-swap
        type="QUOTE"
        class="bg-[#F3F8FF]"
        :class="{ '!bg-[#EEEEEE]': stepSwap === 'CONFIRM_SWAP' }"
        @select-token="handleOpenPopupSelectToken"
        @change="handleInput"
      />
    </div>

    <template v-if="isQuoteExist">
      <InfoSwap v-model:edit-slippage="isEditSlippage" :buy-amount :sell-amount :token0 :token1 :step-swap />
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
  import { useAccount, useBalance, useSignMessage } from '@wagmi/vue'
  import { DEFAULT_SLIPPAGE, NATIVE_TOKEN } from '~/constant'
  import type { IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'
  import HeaderFormSwap from './HeaderFormSwap.vue'

  export type StepSwap = 'SELECT_TOKEN' | 'CONFIRM_SWAP'

  interface IProps {
    title?: string
  }

  const _props = withDefaults(defineProps<IProps>(), {
    title: 'Swap'
  })

  const { setOpenPopup } = useBaseStore()

  const { isSwapping, isConfirmApprove, slippage, isConfirmSwap } = storeToRefs(useSwapStore())

  const isEditSlippage = ref(false)
  const stepSwap = ref<StepSwap>('SELECT_TOKEN')
  const buyAmount = ref('')
  const sellAmount = ref('')
  const token0 = ref<IToken>({
    ...NATIVE_TOKEN
  })
  const token1 = ref<IToken>({
    name: '',
    symbol: '',
    decimals: 0,
    icon_url: '',
    address: ''
  })

  const isFetchQuote = ref(false)

  const isToken0Selected = computed(() => token0.value.symbol !== '')
  const isToken1Selected = computed(() => token1.value.symbol !== '')
  const isQuoteExist = computed(() => buyAmount.value && sellAmount.value)
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
    } else if (isToken0Selected.value && isToken1Selected.value && buyAmount.value && sellAmount.value) {
      if (stepSwap.value === 'SELECT_TOKEN') {
        return `Swap ${sellAmount.value} ${token0.value.symbol} ⇒ ${buyAmount.value} ${token1.value.symbol}`
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
    return !isToken0Selected.value || !isToken1Selected.value || !buyAmount.value || !sellAmount.value || isFetchQuote.value
  })

  const handleSwapOrder = () => {
    if (stepSwap.value === 'CONFIRM_SWAP') return
    ;[token0.value, token1.value] = [token1.value, token0.value]
    handleInput(sellAmount.value, 'BASE')
  }

  const typeOpenPopup = ref<TYPE_SWAP>('BASE')
  const handleOpenPopupSelectToken = (type: TYPE_SWAP) => {
    if (stepSwap.value === 'CONFIRM_SWAP') return
    typeOpenPopup.value = type
    setOpenPopup('popup-select-token', true)
  }

  function handleInput(amount: string, type: TYPE_SWAP) {
    if (!isToken0Selected.value || !isToken1Selected.value) return
    isFetchQuote.value = true
    if (!amount) {
      isFetchQuote.value = false
      buyAmount.value = ''
      sellAmount.value = ''
      isEditSlippage.value = false
      slippage.value = DEFAULT_SLIPPAGE
      return
    }
    setTimeout(() => {
      if (type === 'BASE') {
        buyAmount.value = Number(amount) > 0 ? (Math.random() * 1000).toFixed(3) + '' : ''
      } else {
        sellAmount.value = Number(amount) > 0 ? (Math.random() * 1000).toFixed(3) + '' : ''
      }
      isFetchQuote.value = false
    }, 1000)
  }

  const handleSelectToken = (token: IToken) => {
    if (typeOpenPopup.value === 'BASE') {
      token0.value = token
      if (token.address === token1.value.address) {
        token1.value = { name: '', symbol: '', decimals: 0, icon_url: '', address: '' }
        sellAmount.value = ''
      }
    } else {
      token1.value = token
      token0.value = token.address === token0.value.address ? { address: '', decimals: '', icon_url: '', name: '', symbol: '' } : token0.value
      if (token.address === token0.value.address) {
        token0.value = { name: '', symbol: '', decimals: 0, icon_url: '', address: '' }
        buyAmount.value = ''
      }
    }

    if (isToken0Selected.value && isToken1Selected.value) {
      if ((sellAmount.value && !buyAmount.value) || (sellAmount.value && buyAmount.value)) {
        handleInput(sellAmount.value, 'BASE')
      } else if (!sellAmount.value && buyAmount.value) {
        handleInput(buyAmount.value, 'QUOTE')
      }
    }
  }

  watch(isToken0Selected, () => {
    if (!isToken0Selected.value) {
      sellAmount.value = ''
    }
  })

  watch(isToken1Selected, () => {
    if (!isToken1Selected.value) {
      buyAmount.value = ''
    }
  })

  const { address, isConnected } = useAccount()

  const { data: balance0 } = useBalance(
    computed(() => ({
      address: address.value,
      token: token0.value.address as MaybeRef<`0x${string}`>,
      watch: true
    }))
  )

  const { data: balance1 } = useBalance(
    computed(() => ({
      address: address.value,
      token: token1.value.address as MaybeRef<`0x${string}`>,
      watch: true
    }))
  )

  const token0IsToken = computed(() => token0.value.address !== '')

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
        handleApprove()
      } else {
        // step 3: swap
        swap()
      }
    } catch (error) {
      console.log('🚀 ~ handleSwap ~ error:', error)
    }
  }

  const { approveToken } = useApproveToken()

  const handleApprove = () => {
    try {
      isConfirmApprove.value = true
      approveToken(token0.value.address, swap)
    } catch (error) {
      isConfirmApprove.value = false
      throw new Error()
    }
  }

  const { signMessageAsync } = useSignMessage()
  const swap = async () => {
    try {
      isConfirmApprove.value = false
      isConfirmSwap.value = true
      const msg = ` ${sellAmount.value} ${token0.value.symbol} ⇒ ${buyAmount.value} ${token1.value.symbol}`
      await signMessageAsync({
        message: msg
      })
      isConfirmSwap.value = false
      showNotify('PENDING', msg)
      isSwapping.value = true
      buyAmount.value = ''
      sellAmount.value = ''
      stepSwap.value = 'SELECT_TOKEN'
      setTimeout(() => {
        showNotify('SUCCESS', msg)
        isSwapping.value = false
      }, 5000)
    } catch (error) {
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
              h('img', { src: token0.value.icon_url ? token0.value.icon_url : '/token-default.png', alt: token0.value.symbol, class: 'size-9 rounded-lg' }),
              h('img', {
                src: token1.value.icon_url ? token1.value.icon_url : '/token-default.png',
                alt: token1.value.symbol,
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
</script>

<style scoped lang="scss">
  :deep(.popper-hover-fee) {
    --el-popover-border-radius: 9px;
    --el-popover-padding: 12px 24px 16px;
  }
  .bg-linear {
    background: linear-gradient(91deg, #790c8b 17.53%, #1573fe 84.87%);
  }
  .bg-gray,
  .btn-disabled {
    background: linear-gradient(0deg, #a8a8a8 0%, #a8a8a8 100%);
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
