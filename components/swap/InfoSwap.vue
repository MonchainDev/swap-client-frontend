<template>
  <div class="mt-6 flex flex-col gap-3 rounded-lg border border-dashed border-gray-4 px-[30px] py-4 sm:px-4">
    <div class="flex justify-between">
      <span class="text-sm">Rate</span>
      <div class="flex flex-col items-end text-sm">
        <span class="font-bold">1 {{ form.token0.symbol }} = {{ exchangeRate.base }} {{ form.token1.symbol }}</span>
        <span class="text-gray-6">1 {{ form.token1.symbol }} = {{ exchangeRate.quote }} {{ form.token0.symbol }}</span>
      </div>
    </div>
    <div v-if="form.minimumAmountOut != ''" class="flex justify-between">
      <span class="text-sm">Minimum received</span>
      <div class="flex flex-col items-end text-sm">
        <span class="font-bold"> {{ form.minimumAmountOut }} {{ form.token1.symbol }}</span>
      </div>
    </div>
    <div v-if="form.maximumAmountIn != ''" class="flex justify-between">
      <span class="text-sm">Maximum sold</span>
      <div class="flex flex-col items-end text-sm">
        <span class="font-bold"> {{ form.maximumAmountIn }} {{ form.token0.symbol }}</span>
      </div>
    </div>
    <div class="flex justify-between">
      <span class="text-sm">Trading Fee</span>
      <ElPopover placement="top" width="270" trigger="hover" popper-class="popper-hover-fee" :teleported="false">
        <template #reference>
          <span class="cursor-pointer border-b border-dashed border-gray-6 text-sm font-bold leading-4">{{ formatTradingFee }} {{ form.token0.symbol }}</span>
        </template>
        <div class="flex flex-col gap-2 text-primary">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Trading Fee </span>
            <span class="text-sm font-medium"> {{ formatTradingFee }} {{ form.token0.symbol }}</span>
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
    <div class="flex justify-between">
      <span class="text-sm">Price Impact</span>
      <div class="flex flex-col items-end text-sm">
        <span class="font-bold"> {{ Math.abs(Number(form.priceImpact || 0)) }}%</span>
      </div>
    </div>
    <template v-if="editSlippage">
      <div class="mt-5 border-t border-dashed border-gray-4 pt-5">
        <div class="flex items-center justify-between">
          <span class="text-sm">Setting slippage</span>
          <BaseIcon name="x" size="18" class="cursor-pointer" @click="editSlippage = false" />
        </div>
        <div class="mt-5 flex justify-between sm:flex-col sm:gap-4">
          <div class="flex gap-3 sm:justify-between sm:gap-0">
            <span
              class="flex cursor-pointer items-center justify-center rounded-lg bg-[#E3EEFF] p-3 text-xs font-semibold"
              @click="handleChangeSlippage('1', true)"
              >1%</span
            >
            <span
              class="flex cursor-pointer items-center justify-center rounded-lg bg-[#E3EEFF] p-3 text-xs font-semibold"
              @click="handleChangeSlippage('2', true)"
              >2%</span
            >
            <span
              class="flex cursor-pointer items-center justify-center rounded-lg bg-[#E3EEFF] p-3 text-xs font-semibold"
              @click="handleChangeSlippage('3', true)"
              >3%</span
            >
            <span
              class="flex cursor-pointer items-center justify-center rounded-lg bg-[#E3EEFF] p-3 text-xs font-semibold"
              @click="handleChangeSlippage('4', true)"
              >4%</span
            >
            <span
              class="flex cursor-pointer items-center justify-center rounded-lg bg-[#E3EEFF] p-3 text-xs font-semibold"
              @click="handleChangeSlippage('100', true)"
              >Max</span
            >
          </div>
          <div class="relative flex sm:w-full">
            <ElInput
              v-model="settingSlippage"
              :formatter="(value: string) => formatNumberInput(value)"
              placeholder="0"
              class="input-slippage !h-11 !w-[88px] sm:!w-full sm:flex-1"
              @change="handleChangeSlippage"
            >
              <template #suffix>
                <span class="text-sm text-gray-8">%</span>
              </template>
            </ElInput>
            <span v-if="isErrorSlippage" class="absolute -bottom-4 left-0 text-nowrap text-[10px] text-error">Invalid slippage</span>
            <button class="bg-linear w-20 rounded-ee-lg rounded-se-lg text-white sm:w-[95px]" @click="handleChangeSlippage(settingSlippage)">Apply</button>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex justify-between">
        <span class="text-sm">Slippage</span>
        <span class="text-sm font-bold text-primary">
          <span v-if="stepSwap === 'SELECT_TOKEN'" class="cursor-pointer text-hyperlink underline" @click="editSlippage = true">EDIT</span>
          &nbsp;{{ slippage }}%
        </span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import Decimal from 'decimal.js'
  import type { StepSwap } from './FormSwap.client.vue'

  interface IProps {
    stepSwap: StepSwap
  }

  const { form } = storeToRefs(useSwapStore())

  const _props = withDefaults(defineProps<IProps>(), {
    stepSwap: 'SELECT_TOKEN'
  })

  const editSlippage = defineModel('editSlippage', {
    type: Boolean,
    default: false
  })
  const { slippage } = storeToRefs(useSwapStore())
  const settingSlippage = ref(slippage.value)

  const isErrorSlippage = computed(() => {
    return Number(settingSlippage.value) < 0 || Number(settingSlippage.value) > 100
  })

  const formatTradingFee = computed(() => {
    return new Decimal(form.value.tradingFee.toString()).div(10 ** Number(form.value.token0.decimals || 0)).toFixed(4)
  })

  const exchangeRate = computed(() => {
    return {
      base: new Decimal(Number(form.value.amountOut) / Number(form.value.amountIn)).toSignificantDigits(5).toString(),
      quote: new Decimal(Number(form.value.amountIn) / Number(form.value.amountOut)).toSignificantDigits(5).toString()
    }
  })

  const emit = defineEmits<{
    'change-slippage': []
  }>()

  const handleChangeSlippage = (value: string, byPassError = false) => {
    if (isErrorSlippage.value && !byPassError) return
    settingSlippage.value = value
    slippage.value = value
    editSlippage.value = false
    emit('change-slippage')
  }

  function formatNumberInput(value: string, _isSplit = true) {
    if (!value) return ''
    let text = ''
    // const flag = false
    text = value.replace(/[^\d.]/g, '')

    return text
  }
</script>

<style lang="scss" scoped>
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
