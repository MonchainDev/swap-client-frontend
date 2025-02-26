<template>
  <div
    class="input-swap flex flex-col gap-4 rounded-lg border border-solid border-gray-4 py-4 pl-8 pr-6 sm:px-4 sm:pt-2"
    :class="{ 'pointer-events-none opacity-50': isDisabled }"
    @click="handleClick"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-5">
        <div v-if="isConnected" class="grid grid-cols-[44px_44px_44px_44px] gap-2 sm:grid-cols-[44px_44px]">
          <div
            v-for="(item, index) in 4"
            :key="item"
            class="flex h-6 cursor-pointer items-center justify-center rounded-[4px] bg-[#f5f5f5]"
            :class="{ 'sm:hidden': index % 2 !== 0 }"
          >
            <span class="text-sm text-gray-8">{{ index ? (100 / 4) * index + '%' : 'Max' }}</span>
          </div>
        </div>
      </div>
      <span v-if="isConnected && stepSwap === 'SELECT_TOKEN'" class="text-sm text-gray-8">Max: {{ formattedBalance }}</span>
    </div>
    <div class="flex min-h-10 items-center gap-2">
      <template v-if="isSelected">
        <div class="flex max-w-[150px] cursor-pointer items-center gap-[10px]" @click="emits('select-token', type)">
          <img :src="token.icon_url || ''" alt="logo" class="size-9 rounded-full sm:size-8" @error="handleImageError($event)" />
          <div class="flex flex-col">
            <div class="flex items-center gap-1">
              <span class="font-medium">{{ token.symbol }}</span>
              <!-- <BaseIcon v-if="stepSwap === 'SELECT_TOKEN'" name="arrow" size="18" class="text-secondary -rotate-90" /> -->
            </div>
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
      <div class="flex flex-1 flex-col items-end gap-1">
        <ElInput
          v-model="amount"
          placeholder="0"
          class="input-amount flex-1"
          :class="{ 'disabled-input': !isSelected || stepSwap === 'CONFIRM_SWAP' }"
          :formatter="(value: string) => formatNumberInput(value)"
          :parser="(value: string) => parseNumberInput(value)"
          @focus="emits('focus-input', type)"
          @input="handleInput"
        />
        <span class="text-sm font-semibold text-gray-6">≈ {{ amountUsd }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useAccount } from '@wagmi/vue'

  import type { IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'

  interface IProps {
    isSelected: boolean
    token: IToken
    type: TYPE_SWAP
    balance: string | undefined
    stepSwap?: string
  }

  const props = withDefaults(defineProps<IProps>(), {
    isSelected: false,
    token: () => ({ name: '', symbol: '', icon_url: '', address: '', decimals: 0 }),
    type: 'BASE',
    balance: '0',
    stepSwap: 'SELECT_TOKEN'
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

  const { outOfRange, invalidRange } = useV3DerivedInfo()
  const { startPriceTypedValue, form } = storeToRefs(useLiquidityStore())
  const { poolExits } = usePools()

  const isDisabled = computed(() => {
    const { minPrice, maxPrice } = form.value
    const commonConditions = outOfRange.value || invalidRange.value || minPrice === '' || maxPrice === ''
    return poolExits.value ? commonConditions : commonConditions || startPriceTypedValue.value === ''
  })

  watch(
    () => isDisabled.value,
    (value) => {
      if (value) {
        amount.value = ''
      }
    }
  )

  const formattedBalance = computed(() => {
    return props.isSelected ? formatNumber(Number(props.balance).toFixed(2)) : '0.00'
  })

  const amountUsd = computed(() => {
    const random = Math.random()
    return amount.value ? (random > 0.01 ? '$' + random.toFixed(2) : '<$0.01') : '$0'
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

  function formatNumberInput(value: string, _isSplit = true) {
    if (!value) return ''
    let text = ''
    // const flag = false
    text = value.replace(/[^\d.]/g, '')

    // if (isSplit) {
    //   const arrText: string[] = []

    //   for (let index = 0; index < text.length; index++) {
    //     if (flag) {
    //       if (text[index] !== '.' && text[index] !== '-') {
    //         arrText.push(text[index])
    //       }
    //     } else {
    //       if (text[index] === '.') {
    //         flag = true
    //       }
    //       arrText.push(text[index])
    //     }
    //   }
    //   text = arrText.join('')

    //   if (text.includes('.')) {
    //     const naturalPart = text.toString().split('.')
    //     naturalPart[0] = naturalPart[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    //     return naturalPart.join('.')
    //   } else {
    //     return text === '-' ? '-' : formatNumber(+text)
    //   }
    // }
    return text
  }

  function parseNumberInput(value: string) {
    if (!value) return ''
    value = value.replace(/[^\d.-]/g, '')
    return value.replace(/\$\s?|(,*)/g, '')
  }
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
          height: 28px;
          font-size: 22px;
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
