<template>
  <div class="input-swap flex h-[138px] flex-col gap-4 rounded-lg px-8 pt-4 sm:h-[120px] sm:px-4 sm:pt-2" @click="handleClick">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-5">
        <span class="text-sm text-primary">{{ type === 'BASE' ? 'Sell' : 'Buy' }}</span>
        <div v-if="type === 'BASE' && isConnected" class="grid grid-cols-[44px_44px_44px_44px] gap-2">
          <div
            v-for="(item, index) in 4"
            :key="item"
            class="flex h-[22px] cursor-pointer items-center justify-center rounded-[4px] bg-white"
            :class="{ 'sm:hidden': index % 2 !== 0 }"
          >
            <span class="text-sm text-gray-8">{{ index ? (100 / 4) * index + '%' : 'Max' }}</span>
          </div>
        </div>
      </div>
      <span v-if="isConnected" class="text-sm text-gray-8">Max: {{ formattedBalance }}</span>
    </div>
    <div class="flex items-center gap-2">
      <template v-if="isSelected">
        <div class="flex max-w-[150px] cursor-pointer items-center gap-[10px]" @click="emits('select-token', type)">
          <img :src="token.icon_url" alt="logo" class="size-9 rounded-full sm:size-8" @error="handleImageError($event)" />
          <div class="flex flex-col">
            <div class="flex items-center gap-1">
              <span class="font-medium">{{ token.symbol }}</span>
              <BaseIcon name="arrow" size="18" class="text-secondary -rotate-90" />
            </div>
            <h4 class="line-clamp-1 text-xs text-[#6F6A79]">{{ token.name }}</h4>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="flex h-9 cursor-pointer items-center gap-1 rounded-lg bg-gray-3 px-2" @click="emits('select-token', type)">
          <span class="text-sm text-gray-6">Select token</span>
          <BaseIcon name="arrow" size="18" class="-rotate-90 text-gray-6" />
        </div>
      </template>
      <div class="flex flex-1 flex-col items-end gap-1">
        <ElInput
          v-model="amount"
          :disabled="!isSelected"
          placeholder="0"
          class="input-amount flex-1"
          @focus="emits('focus-input', type)"
          @input="handleInput"
        />
        <span class="text-sm font-semibold text-gray-6">≈ ${{ amount ? Math.random() : '0' }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useAccount } from '@wagmi/vue'

  import type { IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'

  interface IProps {
    isFocus: boolean
    isSelected: boolean
    token: IToken
    type: TYPE_SWAP
    balance: string | undefined
  }

  const props = withDefaults(defineProps<IProps>(), {
    isFocus: false,
    isSelected: false,
    token: () => ({ name: '', symbol: '', icon_url: '', address: '', decimals: 0 }),
    type: 'BASE',
    balance: '0'
  })

  const emits = defineEmits<{
    'focus-input': [value: TYPE_SWAP]
    'select-token': [value: TYPE_SWAP]
    change: [value: string, type: TYPE_SWAP]
  }>()

  const amount = defineModel('amount', {
    type: String,
    required: true,
    default: ''
  })

  const { handleImageError } = useErrorImage()

  const formattedBalance = computed(() => {
    return props.isSelected ? formatNumber(Number(props.balance).toFixed(2)) : '0'
  })

  const handleClick = () => {
    if (!props.isSelected) {
      emits('select-token', props.type)
    }
  }

  const handleInput = useDebounce(() => {
    emits('change', amount.value, props.type)
  }, 400)

  const { isConnected } = useAccount()
</script>

<style lang="scss" scoped>
  .input-swap {
    :deep(.is-disabled.input-amount) {
      cursor: pointer;
    }
    :deep(.input-amount) {
      .el-input__wrapper {
        box-shadow: unset;
        height: 28px;
        background-color: transparent;
        .el-input__inner {
          font-size: 32px;
          text-align: right;
          background: var(--btn, linear-gradient(91deg, #790c8b 60%, #1573fe 98%));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }
  }
</style>
