<template>
  <div class="flex flex-col gap-2 rounded-lg bg-white px-8 pb-10 pt-[21px] shadow-md sm:p-4">
    <div class="flex items-center justify-between">
      <span class="text-2xl font-semibold leading-7 sm:text-lg">{{ title }}</span>
      <div class="flex items-center gap-3">
        <span class="text-sm font-semibold text-gray-6 sm:hidden">Choose network</span>
        <ChooseNetwork />
      </div>
    </div>
    <div class="relative mt-7 flex flex-col gap-1 sm:mt-[14px]">
      <InputSwap
        v-model:amount="sellAmount"
        :is-focus="focusInput.token0"
        :is-selected="isToken0Selected"
        :token="token0"
        :balance="balance0?.formatted"
        type="BASE"
        class="bg-[#EFEFFF]"
        @select-token="handleOpenPopupSelectToken"
        @focus-input="handleFocus"
        @change="handleInput"
      />
      <div class="relative z-10">
        <div
          class="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-[4px] border-solid border-white bg-[#1573FE] p-2"
          @click="handleSwapOrder"
        >
          <BaseIcon name="repeat" class="text-white" size="24" />
        </div>
      </div>
      <InputSwap
        v-model:amount="buyAmount"
        :is-focus="focusInput.token1"
        :is-selected="isToken1Selected"
        :token="token1"
        :balance="balance1?.formatted"
        type="QUOTE"
        class="bg-[#F3F8FF]"
        @select-token="handleOpenPopupSelectToken"
        @focus-input="handleFocus"
        @change="handleInput"
      />
    </div>

    <template v-if="isQuoteExist">
      <div class="mt-6 flex flex-col gap-3 rounded-lg border border-dashed border-gray-4 px-[30px] py-4">
        <div class="flex justify-between">
          <span class="text-sm">Rate</span>
          <div class="flex flex-col items-end text-sm">
            <span class="font-bold">1 {{ token0.symbol }} = 10 {{ token1.symbol }}</span>
            <span class="text-gray-6">1 {{ token1.symbol }} = 0.1 {{ token0.symbol }}</span>
          </div>
        </div>
        <div class="flex justify-between">
          <span class="text-sm">Fee</span>
          <ElPopover placement="top" width="270" trigger="hover" popper-class="popper-hover-fee" :teleported="false">
            <template #reference>
              <span class="cursor-pointer border-b border-dashed border-gray-6 text-sm font-bold leading-4">$0.092</span>
            </template>
            <div class="flex flex-col gap-2 text-primary">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Fee </span>
                <span class="text-sm font-medium">$0.092 </span>
              </div>
              <div class="h-[1px] w-full bg-gray-3"></div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-[#6E6E6E]">Swap fee (15% value) </span>
                <span class="text-sm">$0.022 </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-[#6E6E6E]">Gas fee </span>
                <span class="text-sm">$0.070 </span>
              </div>
            </div>
          </ElPopover>
        </div>
        <template v-if="isEditSlippage">
          <div class="mt-5 border-t border-dashed border-gray-4 pt-5">
            <div class="flex items-center justify-between">
              <span class="text-sm">Setting slippage</span>
              <BaseIcon name="x" size="18" class="cursor-pointer" @click="isEditSlippage = false" />
            </div>
            <div class="mt-5 flex justify-between sm:flex-col sm:gap-4">
              <div class="flex flex-wrap gap-3 sm:justify-between">
                <span class="flex cursor-pointer items-center justify-center rounded-lg bg-[#E3EEFF] p-3 text-xs font-semibold" @click="settingSlippage = '1'"
                  >1%</span
                >
                <span class="flex cursor-pointer items-center justify-center rounded-lg bg-[#E3EEFF] p-3 text-xs font-semibold" @click="settingSlippage = '2'"
                  >2%</span
                >
                <span class="flex cursor-pointer items-center justify-center rounded-lg bg-[#E3EEFF] p-3 text-xs font-semibold" @click="settingSlippage = '3'"
                  >3%</span
                >
                <span class="flex cursor-pointer items-center justify-center rounded-lg bg-[#E3EEFF] p-3 text-xs font-semibold" @click="settingSlippage = '4'"
                  >4%</span
                >
                <span class="flex cursor-pointer items-center justify-center rounded-lg bg-[#E3EEFF] p-3 text-xs font-semibold" @click="settingSlippage = '100'"
                  >Max</span
                >
              </div>
              <div class="flex sm:w-full">
                <ElInput v-model="settingSlippage" placeholder="0" class="input-slippage !h-11 !w-[88px] sm:!w-full sm:flex-1">
                  <template #suffix>
                    <span class="text-sm text-gray-8">%</span>
                  </template>
                </ElInput>
                <button class="bg-linear w-20 rounded-ee-lg rounded-se-lg text-white sm:w-[95px]" @click="slippage = settingSlippage">Apply</button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex justify-between">
            <span class="text-sm">Slippage</span>
            <span class="text-sm font-bold text-primary"
              ><span class="cursor-pointer text-hyperlink underline" @click="isEditSlippage = true">Edit</span> {{ slippage }}%</span
            >
          </div>
        </template>
      </div>
    </template>

    <template v-if="!isEditSlippage">
      <!-- <BaseButton
        v-if="isConnected"
        :disabled="isDisabledButton"
        :type="typeButton"
        class="flex items-center space-x-1 text-lg font-medium"
        @click="setOpenPopup('popup-review-swap')"
      >
        <BaseLoadingButton v-if="isFetchQuote" />
        <span>{{ msgButton }}</span>
      </BaseButton>
      <BaseButton v-else class="text-lg font-medium opacity-70"> Connect wallet </BaseButton> -->
      <button
        v-if="isConnected"
        :disabled="isDisabledButton"
        class="bg-linear mt-5 flex h-[67px] items-center justify-center gap-2 rounded-lg text-xl font-semibold text-white hover:opacity-90 sm:h-[42px] sm:text-sm"
        @click="handleSwap"
      >
        <BaseLoadingButton v-if="isFetchQuote" />
        <span>{{ msgButton }}</span>
      </button>
      <button
        v-else
        class="bg-linear mt-5 flex h-[67px] items-center justify-center gap-2 rounded-lg text-xl font-semibold text-white hover:opacity-90 sm:h-[42px] sm:text-sm"
        @click="setOpenPopup('popup-connect')"
      >
        <BaseIcon name="wallet" size="24" class="text-white" />
        <span>Connect Wallet</span>
      </button>
    </template>

    <PopupSelectToken @select="handleSelectToken" />
  </div>
</template>

<script lang="ts" setup>
  import { useAccount, useBalance } from '@wagmi/vue'
  import { NATIVE_TOKEN } from '~/constant'
  import type { IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'
  import BaseIcon from '../base/BaseIcon.vue'

  interface IProps {
    title?: string
  }

  const _props = withDefaults(defineProps<IProps>(), {
    title: 'Swap'
  })

  const { setOpenPopup } = useBaseStore()

  const { slippage, isSwapping } = storeToRefs(useSwapStore())
  const settingSlippage = ref(slippage.value)
  const isEditSlippage = ref(false)
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

  const focusInput = ref({
    token0: true,
    token1: false
  })
  const isFetchQuote = ref(false)

  const isToken0Selected = computed(() => token0.value.symbol !== '')
  const isToken1Selected = computed(() => token1.value.symbol !== '')
  const isQuoteExist = computed(() => buyAmount.value && sellAmount.value)

  const msgButton = computed(() => {
    if (!isToken0Selected.value || !isToken1Selected.value) {
      return 'Select a token'
    } else if (isFetchQuote.value) {
      return 'Finalizing quote...'
    } else if (isToken0Selected.value && isToken1Selected.value && buyAmount.value && sellAmount.value) {
      return `Swap ${sellAmount.value} ${token0.value.symbol} ⇒ ${buyAmount.value} ${token1.value.symbol}`
    } else {
      return 'Enter an amount'
    }
  })

  const isDisabledButton = computed(() => {
    return !isToken0Selected.value || !isToken1Selected.value || !buyAmount.value || !sellAmount.value || isFetchQuote.value
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
      // Fetch balance
    } else {
      token1.value = token
      // Fetch balance
    }
  }

  const handleInput = (amount: string, type: TYPE_SWAP) => {
    if (!isToken0Selected.value || !isToken1Selected.value) return
    isFetchQuote.value = true
    if (!amount) {
      isFetchQuote.value = false
      buyAmount.value = ''
      sellAmount.value = ''
      return
    }
    setTimeout(() => {
      if (type === 'BASE') {
        buyAmount.value = Number(amount) > 0 ? Math.random() * 1000 + '' : ''
      } else {
        sellAmount.value = Number(amount) > 0 ? Math.random() * 1000 + '' : ''
      }
      isFetchQuote.value = false
    }, 1000)
  }

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

  const handleSwap = () => {
    try {
      isSwapping.value = true
      const el1 = ElNotification({
        // Should pass a function if VNode contains dynamic props
        message: () =>
          h('div', { class: 'flex items-center gap-3' }, [
            h('div', { class: 'flex relative w-[54px]' }, [
              h('img', { src: token0.value.icon_url, alt: token0.value.symbol, class: 'size-9 rounded-lg' }),
              h('img', { src: token1.value.icon_url, alt: token1.value.symbol, class: 'size-9 rounded-lg absolute top-1/2 -translate-y-1/2 left-[18px]' })
            ]),
            h('div', { class: 'flex flex-col flex-1' }, [
              h('span', { class: 'text-sm text-primary font-medium' }, 'Swapping'),
              h('span', { class: 'text-xs text-gray-8' }, ` ${sellAmount.value} ${token0.value.symbol} ⇒ ${buyAmount.value} ${token1.value.symbol}`)
            ])
          ]),
        duration: 0,
        customClass: 'notify-swap',
        showClose: false,
        offset: 72
      })

      setTimeout(() => {
        el1.close()
        isSwapping.value = false
        ElNotification({
          // Should pass a function if VNode contains dynamic props
          message: () =>
            h('div', { class: 'flex items-center gap-3' }, [
              h('img', { src: '/tick-success.png', alt: 'tick', class: 'size-10 ' }),
              h('div', { class: 'flex flex-col flex-1' }, [
                h('span', { class: 'text-sm text-[#049C6B] font-medium' }, 'Swapping successfully'),
                h('span', { class: 'text-xs text-gray-8 pr-5' }, ` ${sellAmount.value} ${token0.value.symbol} ⇒ ${buyAmount.value} ${token1.value.symbol}`)
              ])
            ]),
          duration: 5000,
          customClass: 'notify-swap',
          offset: 72
        })
      }, 4000)
    } catch (error) {
      isSwapping.value = false
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
  :deep(.input-slippage) {
    .el-input__wrapper {
      box-shadow: unset;
      border: 1px solid var(--color-gray-4);
      border-radius: 8px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    .el-input__inner {
      font-size: 16px;
      color: var(--color-primary);
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
</style>
