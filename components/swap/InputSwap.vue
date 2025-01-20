<template>
  <div class="border-base input-swap flex flex-col bg-surface2 p-4" :class="{ '!bg-transparent': isFocus }" @click="handleClick">
    <span class="text-secondary">{{ type === 'BASE' ? 'Sell' : 'Buy' }}</span>
    <div class="flex items-center gap-2 py-2">
      <ElInput v-model="amount" :disabled="!isSelected" placeholder="0" class="input-amount flex-1" @focus="emits('focus-input', type)" @input="handleInput" />
      <template v-if="isSelected">
        <div class="border-base flex h-9 cursor-pointer items-center gap-1 px-2" @click="emits('select-token', type)">
          <img :src="token.icon_url" alt="logo" class="size-7" @error="handleImageError($event)" />
          <span class="font-medium">{{ token.symbol }}</span>
          <BaseIcon name="arrow" size="24" class="-rotate-90 text-secondary" />
        </div>
      </template>
      <template v-else>
        <div class="border-base flex h-9 cursor-pointer items-center gap-1 bg-pink px-2" @click="emits('select-token', type)">
          <span class="text-white">Select token</span>
          <BaseIcon name="arrow" size="24" class="-rotate-90 text-white" />
        </div>
      </template>
    </div>
    <div v-if="isSelected" class="flex justify-end">
      <div class="flex items-center gap-1 text-sm text-secondary">
        <span>{{ formatNumber(balance) }} {{ token.symbol }}</span>
        <span class="cursor-pointer rounded-full bg-surface3 p-1 text-xs">Max</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'

  interface IProps {
    isFocus: boolean
    isSelected: boolean
    token: IToken
    type: TYPE_SWAP
    balance: string
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

  const handleClick = () => {
    if (!props.isSelected) {
      emits('select-token', props.type)
    }
  }

  const handleInput = useDebounce(() => {
    emits('change', amount.value, props.type)
  }, 400)
</script>

<style lang="scss" scoped>
  .input-swap {
    :deep(.is-disabled.input-amount) {
      cursor: pointer;
    }
    :deep(.input-amount) {
      .el-input__wrapper {
        box-shadow: unset;
        height: 44px;
        background-color: transparent;
        .el-input__inner {
          font-size: 36px;
          color: var(--color-primary);
        }
      }
    }
  }
</style>
