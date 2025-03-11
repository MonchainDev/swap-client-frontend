<template>
  <div class="input-swap flex flex-col gap-4 rounded-lg px-8 pt-4 sm:px-4 sm:pt-2" @click="handleClick">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-5">
        <span class="text-sm text-primary">{{ getTitle }}</span>
        <div v-if="type === 'BASE' && isConnected && stepBridge === 'SELECT_TOKEN'" class="grid grid-cols-[44px_44px_44px_44px] gap-2 sm:grid-cols-[44px_44px]">
          <div
            v-for="(item, index) in 4"
            :key="item"
            class="flex h-[22px] cursor-pointer items-center justify-center rounded-[4px] bg-white"
            :class="{ 'sm:hidden': index % 2 !== 0 }"
            @click="handleSelectPercent(index)"
          >
            <span class="text-sm text-gray-8">{{ index ? (100 / 4) * index + '%' : 'Max' }}</span>
          </div>
        </div>
      </div>
      <!-- <span v-if="isConnected && stepBridge === 'SELECT_TOKEN'" class="text-sm text-gray-8">Max: {{ formattedBalance }}</span> -->
    </div>
    <div class="flex min-h-10 items-center gap-2">
      <template v-if="isSelected">
        <div class="flex max-w-[150px] cursor-pointer items-center gap-[10px]" @click="emits('select-token', type)">
          <img :src="token.icon_url" alt="logo" class="size-9 rounded-full sm:size-8" @error="handleImageError($event)" />
          <div class="flex flex-col">
            <div class="flex items-center gap-1">
              <span class="font-medium">{{ token.symbol }}</span>
              <BaseIcon v-if="stepBridge === 'SELECT_TOKEN'" name="arrow" size="18" class="text-secondary -rotate-90" />
            </div>
            <h4 class="line-clamp-1 text-xs text-[#6F6A79]">{{ token.name }}</h4>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="flex h-9 cursor-pointer items-center gap-[10px] rounded-lg" @click="emits('select-token', type)">
          <!-- <span class="text-sm text-gray-6">Select token</span>
          <BaseIcon name="arrow" size="18" class="-rotate-90 text-gray-6" /> -->
          <img src="/empty-token.png" alt="empty token" class="size-9 sm:size-8" />

          <div class="flex items-center gap-1 text-gray-6">
            <span>Select a token</span>
            <BaseIcon name="arrow" size="18" class="-rotate-90 text-gray-6" />
          </div>
        </div>
      </template>
      <div v-if="type === 'SEND'" class="flex flex-1 flex-col items-end gap-1">
        <ElInput
          v-model="amount"
          placeholder="Enter amount"
          class="input-amount flex-1"
          :class="{ 'disabled-input': !isSelected || stepBridge === 'CONFIRM_BRIDGE' }"
          :formatter="(value: string) => formatNumberInput(value)"
          :parser="(value: string) => parseNumberInput(value)"
          @focus="emits('focus-input', type)"
          @input="handleInput"
        />
        <!-- <span v-if="type === 'BASE'" class="text-sm font-semibold text-gray-6">≈ {{ amountUsd }}</span> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useAccount } from '@wagmi/vue'

  import type { IToken } from '~/types'
  import type { TYPE_BRIDGE } from '~/types/bridge.type'
  import type { StepBridge } from './FormBridge.client.vue'
  import Decimal from 'decimal.js'

  interface IProps {
    isSelected: boolean
    token: IToken
    type: TYPE_BRIDGE
    balance: string | undefined
    stepBridge: StepBridge
  }

  const props = withDefaults(defineProps<IProps>(), {
    isSelected: false,
    token: () => ({ name: '', symbol: '', icon_url: '', address: '', decimals: 0 }),
    type: 'BASE',
    balance: '0',
    stepBridge: 'SELECT_TOKEN'
  })

  const emits = defineEmits<{
    'focus-input': [value: TYPE_BRIDGE]
    'select-token': [value: TYPE_BRIDGE]
    change: [value: string, type: TYPE_BRIDGE]
  }>()

  const amount = defineModel('amount', {
    type: String,
    required: true,
    default: ''
  })

  const { handleImageError } = useErrorImage()

  // const formattedBalance = computed(() => {
  //   return props.isSelected ? formatNumber(Number(props.balance).toFixed(2)) : '0.00'
  // })

  // const amountUsd = computed(() => {
  //   const random = Math.random()
  //   return amount.value ? (random > 0.01 ? '$' + random.toFixed(2) : '<$0.01') : '$0'
  // })

  const handleClick = () => {
    if (!props.isSelected) {
      emits('select-token', props.type)
    }
  }

  const handleInput = useDebounce(() => {
    emits('change', amount.value, props.type)
  }, 400)

  const handleSelectPercent = (index: number) => {
    const percent = [1, 0.25, 0.5, 0.75][index]
    const balance = props.balance
    if (balance) {
      const result = new Decimal(balance).mul(percent).toSignificantDigits(6, Decimal.ROUND_DOWN).toString()
      emits('change', result, props.type)
    }
  }

  const { isConnected } = useAccount()

  const getTitle = computed(() => {
    if (props.type === 'BASE') return 'From network'
    else if (props.type === 'QUOTE') return 'To network'
    else return 'Send'
  })
</script>

<style lang="scss" scoped>
  .input-swap {
    :deep(.is-disabled.input-amount) {
      cursor: pointer;
    }
    :deep(.input-amount) {
      .el-input__wrapper {
        box-shadow: unset;
        background-color: transparent;
        padding-right: 0;

        .el-input__inner {
          height: 32px;
          font-size: 32px;
          font-weight: 600;
          text-align: right;
          background: linear-gradient(91deg, #790c8b 60%, #1573fe 98%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          overflow: hidden;
          &::placeholder {
            background: linear-gradient(91deg, #a8abb2 0%, #a8abb2 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
      }
    }
    :deep(.disabled-input) {
      cursor: not-allowed;
      pointer-events: none;
    }
  }
</style>
