<template>
  <div class="mx-auto mt-10 max-w-[462px] sm:px-3">
    <ElPopover
      v-model:visible="visible"
      placement="bottom-end"
      width="320"
      :show-arrow="false"
      trigger="click"
      popper-class="popper-setting-swap"
      :teleported="false"
    >
      <template #reference>
        <div class="flex justify-end">
          <BaseIcon name="setting" class="text-secondary cursor-pointer" size="20" />
        </div>
      </template>
      <div class="flex flex-col gap-4 text-primary">
        <span class="text-center text-lg leading-6">Swap setting</span>
        <div class="flex flex-col">
          <div class="flex h-12 items-center justify-between">
            <span class="text-base">Max slippage</span>
            <div class="border-base flex items-center gap-1 p-1">
              <span
                class="text-secondary rounded-full border border-transparent bg-surface3 px-1 text-sm"
                :class="{ '!bg-[#fef4ff] !text-pink': activeSlippageAuto }"
                >Auto</span
              >
              <ElInput
                v-model="slippage"
                class="input-amount"
                :placeholder="activeSlippageAuto ? DEFAULT_SLIPPAGE.toString() : ''"
                @focus="handleFocusSlippage"
                @blur="handleBlurSlippage"
              >
                <template #suffix>
                  <span class="text-sm">%</span>
                </template>
              </ElInput>
            </div>
          </div>
          <div class="flex h-12 items-center justify-between">
            <span class="text-base">Tx.deadline</span>
            <div class="border-base w-[123px] p-1">
              <ElInput v-model="txDeadline" class="input-amount">
                <template #suffix>
                  <span class="text-sm">minutes</span>
                </template>
              </ElInput>
            </div>
          </div>
        </div>
        <BaseButton type="surface" size="sm" class="w-full text-lg font-medium !text-primary" @click="visible = false">Close</BaseButton>
      </div>
    </ElPopover>
    <FormSwap class="mt-2" />
  </div>
</template>

<script lang="ts" setup>
  import { DEFAULT_SLIPPAGE } from '~/constant'

  useHead({
    title: 'Buy, sell & trade Ethereum and other top tokens'
  })

  const { slippage, activeSlippageAuto, txDeadline } = storeToRefs(useSwapStore())
  const visible = ref(false)

  const handleBlurSlippage = () => {
    if (slippage.value === '') {
      activeSlippageAuto.value = true
    }
  }

  const handleFocusSlippage = () => {
    activeSlippageAuto.value = false
  }
</script>

<style lang="scss" scoped>
  :deep(.popper-setting-swap) {
    --el-popover-border-radius: 16px;
    --el-popover-padding: 16px;

    .input-amount {
      .el-input__wrapper {
        width: 70px;
        box-shadow: unset;
        height: 21px;
        background-color: transparent;
        .el-input__inner {
          font-size: 16px;
          color: var(--color-primary);
          text-align: right;
        }
      }
    }
  }
</style>
