<template>
  <div class="flex h-[90px] items-center justify-between gap-1 border border-solid border-gray-3 px-4">
    <div class="flex flex-col gap-2">
      <span class="text-xs text-gray-8">{{ formatText }} </span>
      <ElInput
        v-model="amount"
        placeholder="0.0"
        class="input-amount flex-1"
        :formatter="(value: string) => formatNumberInput(value)"
        :parser="(value: string) => parseNumberInput(value)"
        @input="handleInput"
        @blur="emits('blur', props.type)"
      />
      <span class="text-xs text-gray-8">{{ textSuffix }}</span>
    </div>
    <div class="flex flex-col gap-1">
      <div
        class="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-solid border-gray-3"
        :class="{ 'pointer-events-none cursor-default bg-gray-2 opacity-70': isDisabledMinusAndPlus }"
        @click="emits('increase')"
      >
        <BaseIcon name="plus" size="24" />
      </div>
      <div
        class="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-solid border-gray-3"
        :class="{ 'pointer-events-none cursor-default bg-gray-2 opacity-70': isDisabledMinusAndPlus }"
        @click="emits('decrease')"
      >
        <BaseIcon name="minus" size="24" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { INPUT_PRICE } from './BlockAddLiquidityRight.vue'

  interface IProps {
    type: INPUT_PRICE
  }

  const props = withDefaults(defineProps<IProps>(), {
    type: 'MIN'
  })

  const { form, leftRangeTypedValue, rightRangeTypedValue } = storeToRefs(useLiquidityStore())

  const isDisabledMinusAndPlus = computed(() => {
    return typeof leftRangeTypedValue.value === 'boolean' || typeof rightRangeTypedValue.value === 'boolean'
  })

  const formatText = computed(() => {
    return props.type === 'MIN' ? 'Min price' : 'Max price'
  })

  const textSuffix = computed(() => {
    return `${form.value.token1.symbol} per ${form.value.token0.symbol}`
  })

  const amount = defineModel('amount', {
    type: String,
    required: true,
    default: ''
  })

  const emits = defineEmits<{
    change: [value: string, type: INPUT_PRICE]
    blur: [type: INPUT_PRICE]
    increase: []
    decrease: []
  }>()

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
        height: 28px;
        font-size: 22px;
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
