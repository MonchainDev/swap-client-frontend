<template>
  <div class="flex flex-col gap-6">
    <ShortInfoPair />
    <div class="border-base flex flex-col gap-8 p-6">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-lg">Initial price </span>
            <span class="text-sm text-secondary">Set the starting exchange rate between the two tokens you are providing. </span>
          </div>
          <div class="border-base flex gap-2 p-1 text-xs font-medium text-secondary">
            <span class="cursor-pointer px-2 py-[2px]" :class="{ 'tab-active': tabActive === 'BASE' }" @click="tabActive = 'BASE'">{{
              form.token0.symbol
            }}</span>
            <span class="cursor-pointer px-2 py-[2px]" :class="{ 'tab-active': tabActive === 'QUOTE' }" @click="tabActive = 'QUOTE'">{{
              form.token1.symbol
            }}</span>
          </div>
        </div>
        <ElInput v-model="form.amount" type="text" placeholder="0" class="input-amount">
          <template #suffix>{{ textSuffix }}</template>
        </ElInput>
        <span class="text-sm text-secondary"
          >Current price:
          <span v-if="form.amount" class="font-medium text-primary">1 {{ form.token1.symbol }} = {{ calcPriceInit }} {{ form.token0.symbol }}</span></span
        >
      </div>
      <div class="flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <span class="text-lg">Set price range </span>
          <div class="border-base flex gap-2 p-1 text-xs font-medium text-secondary">
            <span class="cursor-pointer px-2 py-[2px]" :class="{ 'tab-active': tabActive === 'BASE' }" @click="tabActive = 'BASE'">{{
              form.token0.symbol
            }}</span>
            <span class="cursor-pointer px-2 py-[2px]" :class="{ 'tab-active': tabActive === 'QUOTE' }" @click="tabActive = 'QUOTE'">{{
              form.token1.symbol
            }}</span>
          </div>
        </div>
        <div class="border-base flex gap-2 p-1 text-xs font-medium text-secondary">
          <span
            class="h-8 flex-1 cursor-pointer px-2 py-[2px] text-center leading-8"
            :class="{ 'tab-active': form.typeRange === 'FULL' }"
            @click="handleChangeRangeType('FULL')"
            >Full range</span
          >
          <span
            class="h-8 flex-1 cursor-pointer px-2 py-[2px] text-center leading-8"
            :class="{ 'tab-active': form.typeRange === 'CUSTOM' }"
            @click="handleChangeRangeType('CUSTOM')"
            >Custom range</span
          >
        </div>
        <span class="text-sm text-secondary"
          >{{
            form.typeRange === 'FULL'
              ? 'Providing full range liquidity ensures continuous market participation across all possible prices, offering simplicity but with potential for higher impermanent loss.'
              : 'Custom range allows you to concentrate your liquidity within specific price bounds, enhancing capital efficiency and fee earnings but requiring more active management.'
          }}
        </span>
        <div class="grid grid-cols-2 gap-1">
          <div class="col-span-2 rounded-t-[20px] bg-surface2 p-4">
            <spa class="text-sm text-secondary"
              >Current price: <span class="text-primary">1 {{ form.token0.symbol }} = {{ calcPriceCurrent }} {{ form.token1.symbol }}</span>
            </spa>
          </div>
          <div class="col-span-1 flex flex-col gap-1 rounded-es-[20px] bg-surface2 p-4">
            <span class="text-sm text-secondary">Max price</span>
            <input v-model="form.minPrice" type="text" placeholder="0" class="h-11 bg-surface2 text-2xl focus:outline-none" @input="handleInputRange" />
            <span class="text-sm text-secondary">{{ textSuffix }} </span>
          </div>
          <div class="col-span-1 flex flex-col gap-1 rounded-ee-[20px] bg-surface2 p-4">
            <span class="text-sm text-secondary">Min price</span>
            <input v-model="form.maxPrice" type="text" placeholder="0" class="h-11 bg-surface2 text-2xl focus:outline-none" @input="handleInputRange" />
            <span class="text-sm text-secondary">{{ textSuffix }} </span>
          </div>
        </div>
        <BaseButton :disabled="!form.amount" type="black" class="text-white" @click="emit('continue')">Continue</BaseButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const emit = defineEmits<{
    continue: []
  }>()

  const { form } = storeToRefs(usePositionStore())

  const tabActive = ref<'QUOTE' | 'BASE'>('BASE')

  const textSuffix = computed(() => {
    return tabActive.value === 'BASE'
      ? `${form.value.token1.symbol} per ${form.value.token0.symbol}`
      : `${form.value.token0.symbol} per ${form.value.token1.symbol}`
  })

  const calcPriceInit = computed(() => {
    return tabActive.value === 'BASE' ? (1 / Number(form.value.amount)).toFixed(5) : Number(form.value.amount).toFixed(5)
  })

  const calcPriceCurrent = computed(() => {
    return tabActive.value === 'QUOTE' ? (1 / Number(form.value.amount)).toFixed(5) : Number(form.value.amount).toFixed(5)
  })

  const handleChangeRangeType = (type: 'FULL' | 'CUSTOM') => {
    form.value.typeRange = type
    form.value.minPrice = type === 'FULL' ? '0' : ''
    form.value.maxPrice = type === 'FULL' ? '∞' : ''
  }
  const handleInputRange = () => {
    form.value.typeRange = 'CUSTOM'
  }
</script>

<style lang="scss" scoped>
  .tab-active {
    background-color: #f0f0f0;
    border-radius: 9999px;
    color: var(--color-primary);
  }
  :deep(.input-amount) {
    height: 58px;
    .el-input__wrapper {
      padding: 12px 16px;
      background-color: #f9f9f9;
      border-radius: 16px;
      box-shadow: unset;
      border: 1px solid var(--color-surface3);
      .el-input__inner {
        font-size: 24px;
        font-weight: 500;
        color: var(--color-primary);
      }
      .el-input__suffix {
        .el-input__suffix-inner {
          font-size: 16px;
          color: var(--color-secondary);
        }
      }
    }
  }
</style>
