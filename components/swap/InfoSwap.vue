<template>
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
    <template v-if="editSlippage">
      <div class="mt-5 border-t border-dashed border-gray-4 pt-5">
        <div class="flex items-center justify-between">
          <span class="text-sm">Setting slippage</span>
          <BaseIcon name="x" size="18" class="cursor-pointer" @click="editSlippage = false" />
        </div>
        <div class="mt-5 flex justify-between sm:flex-col sm:gap-4">
          <div class="flex gap-3 sm:flex-wrap sm:justify-between">
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
          ><span class="cursor-pointer text-hyperlink underline" @click="editSlippage = true">Edit</span> {{ slippage }}%</span
        >
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { IToken } from '~/types'

  interface IProps {
    token0: IToken
    token1: IToken
  }

  const _props = withDefaults(defineProps<IProps>(), {
    token0: () => ({}) as IToken,
    token1: () => ({}) as IToken
  })

  const editSlippage = defineModel('editSlippage', {
    type: Boolean,
    default: false
  })
  const { slippage } = storeToRefs(useSwapStore())
  const settingSlippage = ref(slippage.value)
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
