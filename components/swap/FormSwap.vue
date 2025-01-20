<template>
  <div class="flex flex-col gap-2">
    <div class="relative flex flex-col gap-1">
      <InputSwap
        v-model:amount="sellAmount"
        :is-focus="focusInput.token0"
        :is-selected="isToken0Selected"
        :token="token0"
        :balance="balance0"
        type="BASE"
        @select-token="handleOpenPopupSelectToken"
        @focus-input="handleFocus"
        @change="handleInput"
      />
      <div class="relative z-10">
        <div
          class="absolute left-1/2 top-1/2 flex size-[52px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-2xl border-[4px] border-solid border-white bg-surface2 p-2 hover:bg-[#f5f5f5]"
          @click="handleSwapOrder"
        >
          <BaseIcon name="arrow-down" class="text-primary" size="24" />
        </div>
      </div>
      <InputSwap
        v-model:amount="buyAmount"
        :is-focus="focusInput.token1"
        :is-selected="isToken1Selected"
        :token="token1"
        :balance="balance1"
        type="QUOTE"
        @select-token="handleOpenPopupSelectToken"
        @focus-input="handleFocus"
        @change="handleInput"
      />
    </div>
    <BaseButton
      v-if="isLogged"
      :disabled="isDisabledButton"
      :type="typeButton"
      class="flex items-center space-x-1 text-lg font-medium"
      @click="setOpenPopup('popup-review-swap')"
    >
      <div v-if="isFetchQuote" class="loader"></div>
      <span>{{ msgButton }}</span>
    </BaseButton>
    <BaseButton v-else class="text-lg font-medium opacity-70" @click="connectWallet"> Connect wallet </BaseButton>

    <template v-if="isQuoteExist">
      <div class="mt-3">
        <div class="flex items-center justify-between text-sm text-secondary">
          <span>1 {{ token1.symbol }} = {{ Math.random() }} {{ token0.symbol }}</span>
          <div class="flex cursor-pointer items-center gap-1" @click="isOpenInfoFee = !isOpenInfoFee">
            <template v-if="!isOpenInfoFee">
              <BaseIcon name="gas" size="12" class="text-secondary" />
              <span>${{ Math.random().toFixed(3) }}</span>
            </template>
            <BaseIcon name="arrow" size="14" class="-rotate-90 text-secondary" />
          </div>
        </div>
        <div class="max-h-0 overflow-hidden transition-all duration-200" :class="{ 'max-h-[200px]': isOpenInfoFee }">
          <div class="mt-3 flex flex-col gap-2">
            <div class="flex items-center justify-between text-sm text-secondary">
              <span>Fee (0.25%)</span>
              <span class="text-primary">$10.00</span>
            </div>
          </div>
          <div class="mt-3 flex flex-col gap-2">
            <div class="flex items-center justify-between text-sm text-secondary">
              <span>Network cost</span>
              <span class="text-primary">$0.86</span>
            </div>
          </div>
          <div class="mt-3 flex flex-col gap-2">
            <div class="flex items-center justify-between text-sm text-secondary">
              <span>Order routing </span>
              <span class="text-primary">Uniswap API</span>
            </div>
          </div>
          <div class="mt-3 flex flex-col gap-2">
            <div class="flex items-center justify-between text-sm text-secondary">
              <span>Price impact</span>
              <span class="text-primary">1.15%</span>
            </div>
          </div>
          <div class="mt-3 flex flex-col gap-2">
            <div class="flex items-center justify-between text-sm text-secondary">
              <span>Max slippage</span>
              <span class="text-primary">{{ slippage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <PopupSelectToken @select="handleSelectToken" />
    <PopupReviewSwap :buy-amount="buyAmount" :sell-amount="sellAmount" :token0="token0" :token1="token1" />
  </div>
</template>

<script lang="ts" setup>
  import { NATIVE_TOKEN } from '~/constant'
  import type { IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'

  const { setOpenPopup } = useBaseStore()
  const { connectWallet } = useWeb3()
  const { isLogged } = storeToRefs(useAuthStore())
  const { slippage } = storeToRefs(useSwapStore())

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
  const balance0 = ref('')
  const balance1 = ref('')
  const focusInput = ref({
    token0: true,
    token1: false
  })
  const isFetchQuote = ref(false)
  const isOpenInfoFee = ref(false)

  const isToken0Selected = computed(() => token0.value.symbol !== '')
  const isToken1Selected = computed(() => token1.value.symbol !== '')
  const isQuoteExist = computed(() => buyAmount.value && sellAmount.value)

  const typeButton = computed(() => {
    if (!isToken0Selected.value || !isToken1Selected.value) {
      return 'surface'
    } else if (isFetchQuote.value) {
      return 'surface'
    } else if (isToken0Selected.value && isToken1Selected.value && buyAmount.value && sellAmount.value) {
      return 'primary'
    } else {
      return 'surface'
    }
  })

  const msgButton = computed(() => {
    if (!isToken0Selected.value || !isToken1Selected.value) {
      return 'Select a token'
    } else if (isFetchQuote.value) {
      return 'Finalizing quote...'
    } else if (isToken0Selected.value && isToken1Selected.value && buyAmount.value && sellAmount.value) {
      return 'Review'
    } else {
      return 'Enter an amount'
    }
  })

  const isDisabledButton = computed(() => {
    return !isToken0Selected.value || !isToken1Selected.value || !buyAmount.value || !sellAmount.value
  })

  const handleFocus = (token: TYPE_SWAP) => {
    if (token === 'BASE') {
      focusInput.value.token0 = true
      focusInput.value.token1 = false
    } else {
      focusInput.value.token0 = false
      focusInput.value.token1 = true
    }
  }

  const handleSwapOrder = () => {
    const temp = token0.value
    token0.value = token1.value
    token1.value = temp
    focusInput.value.token0 = !focusInput.value.token0
    focusInput.value.token1 = !focusInput.value.token1
  }

  const typeOpenPopup = ref<TYPE_SWAP>('BASE')
  const handleOpenPopupSelectToken = (type: TYPE_SWAP) => {
    typeOpenPopup.value = type
    setOpenPopup('popup-select-token', true)
  }

  const handleSelectToken = (token: IToken) => {
    if (typeOpenPopup.value === 'BASE') {
      token0.value = token
      handleGetBalance('BASE')
    } else {
      token1.value = token
      handleGetBalance('QUOTE')
    }
  }

  const handleInput = (amount: string, type: TYPE_SWAP) => {
    if (!isToken0Selected.value || !isToken1Selected.value) return
    isFetchQuote.value = true
    setTimeout(() => {
      if (type === 'BASE') {
        buyAmount.value = Number(amount) > 0 ? Math.random() * 1000 + '' : ''
      } else {
        sellAmount.value = Number(amount) > 0 ? Math.random() * 1000 + '' : ''
      }
      isFetchQuote.value = false
    }, 1000)
  }

  onMounted(() => {
    handleGetBalance('BASE')
  })

  const { getBalance } = useWeb3()

  const handleGetBalance = async (type: TYPE_SWAP) => {
    if (type === 'BASE') {
      const rs = await getBalance(token0.value)
      balance0.value = rs
    } else {
      const rs = await getBalance(token1.value)
      balance1.value = rs
    }
  }
</script>

<style lang="scss" scoped>
  .loader {
    width: 18px;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 3px solid var(--color-surface3);
    border-right-color: var(--color-secondary);
    animation: l2 1s infinite linear;
  }
  @keyframes l2 {
    0% {
      transform: rotate(0turn);
    }
    30% {
      transform: rotate(0.7turn);
    }
    100% {
      transform: rotate(1turn);
    }
  }

  .transaction-height {
  }
</style>
