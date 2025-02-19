<template>
  <div class="flex items-center justify-between gap-1 py-3 pl-6 pr-3">
    <div class="flex flex-col">
      <span class="text-sm">{{ formatText }}</span>
      <ElInput
        v-model="amount"
        placeholder="0"
        class="input-amount flex-1"
        :formatter="(value: string) => formatNumberInput(value)"
        :parser="(value: string) => parseNumberInput(value)"
        @input="handleInput"
      />
      <span>{{ textSuffix }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { TYPE_SWAP } from '~/types/swap.type'
  import type { INPUT_PRICE } from './LiquidityStep2.vue'

  interface IProps {
    type: INPUT_PRICE
    activeRange: TYPE_SWAP
  }

  const props = withDefaults(defineProps<IProps>(), {
    type: 'MIN',
    activeRange: 'BASE'
  })

  const { form } = storeToRefs(useLiquidityStore())

  const formatText = computed(() => {
    return props.type === 'MIN' ? 'Min price' : 'Max price'
  })

  const textSuffix = computed(() => {
    return props.activeRange === 'BASE'
      ? `${form.value.token1.symbol} per ${form.value.token0.symbol}`
      : `${form.value.token0.symbol} per ${form.value.token1.symbol}`
  })

  const amount = defineModel('amount', {
    type: String,
    required: true,
    default: ''
  })

  const emits = defineEmits<{
    change: [value: string, type: INPUT_PRICE]
  }>()

  function formatNumberInput(value: string, _isSplit = true) {
    if (!value) return ''
    let text = ''
    text = value.replace(/[^\d.]/g, '')
    return text
  }

  function parseNumberInput(value: string) {
    if (!value) return ''
    value = value.replace(/[^\d.-]/g, '')
    return value.replace(/\$\s?|(,*)/g, '')
  }

  const handleInput = useDebounce(() => {
    emits('change', amount.value, props.type)
  }, 400)
</script>

<style lang="scss" scoped>
  :deep(.input-amount) {
    .el-input__wrapper {
      box-shadow: unset;
      background-color: transparent;
      padding: 0;

      .el-input__inner {
        height: 24px;
        font-size: 16px;
        font-weight: 600;
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
</style>
