<template>
  <div class="flex flex-col gap-7">
    <div v-if="props.showHeader" class="flex items-center gap-5 text-sm">
      <span class="text-2xl font-semibold leading-7">Pair info</span>
      <div class="flex items-center gap-1">
        <img src="/token-default.png" alt="logo" class="size-[14px] rounded-full" />
        <span>1 ATOM = 0.002 USDC</span>
      </div>
      <div class="flex items-center gap-1">
        <img src="/token-default.png" alt="logo" class="size-[14px] rounded-full" />
        <span> 1 USDC = 566.35 ATOM</span>
      </div>
    </div>
    <div class="grid h-[421px] grid-cols-[374px_1fr] gap-6">
      <div class="rounded-lg bg-white px-6 py-4 shadow-md">
        <div class="flex flex-col gap-[6px]">
          <span class="text-sm">Total Tokens locked (TVL)</span>
          <div class="flex items-center gap-3">
            <span class="text-xl font-semibold">$5.63M</span>
            <span class="flex items-center gap-1 rounded-[10px] bg-[#E8FFEB] px-2 py-[2px]">
              <BaseIcon name="arrow-fill" size="12" class="rotate-180 text-success" />
              <span class="text-sm font-semibold text-success">0.04%</span>
            </span>
          </div>
        </div>
        <div class="mt-[31px] flex flex-col gap-3 border-b border-t border-solid border-gray-3 py-5 pt-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-[5px]">
              <img src="/token-default.png" alt="logo" class="size-[14px] rounded-full" />
              <span class="text-sm">ATOM</span>
            </div>
            <span class="text-sm">1.53M</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-[5px]">
              <img src="/token-default.png" alt="logo" class="size-[14px] rounded-full" />
              <span class="text-sm">USDC</span>
            </div>
            <span class="text-sm">6,289.56</span>
          </div>
        </div>
        <div class="mt-[35px] flex flex-col gap-8">
          <div class="flex flex-col gap-[6px]">
            <span class="text-sm">Volume 24h</span>
            <div class="flex items-center gap-3">
              <span class="text-xl font-semibold">$80.32M</span>
              <span class="flex items-center gap-1 rounded-[10px] bg-[#E8FFEB] px-2 py-[2px]">
                <BaseIcon name="arrow-fill" size="12" class="rotate-180 text-success" />
                <span class="text-sm font-semibold text-success">0.04%</span>
              </span>
            </div>
          </div>
          <div class="flex flex-col gap-[6px]">
            <span class="text-sm">Fee 24h</span>
            <div class="flex items-center gap-3">
              <span class="text-xl font-semibold">$80.32M</span>
              <span class="flex items-center gap-1 rounded-[10px] bg-[#FFECEF] px-2 py-[2px]">
                <BaseIcon name="arrow-fill" size="12" class="rotate-180 text-error" />
                <span class="text-sm font-semibold text-error">0.04%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="rounded-lg bg-white px-6 py-4 shadow-md">
        <BaseTab v-model:model="tabActive" :list="listTab" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { ITab } from '~/types/component.type'
  const enum TabValue {
    VOLUME = 'VOLUME',
    LIQUIDITY = 'LIQUIDITY',
    FEE = 'FEE',
    TVL = 'TVL'
  }

  interface IProps {
    showHeader?: boolean
  }

  const props = withDefaults(defineProps<IProps>(), {
    showHeader: true
  })

  // const route = useRoute('liquidity-pool-network-address')

  const listTab: ITab[] = [
    {
      title: 'Volume',
      value: 'VOLUME'
    },
    {
      title: 'Liquidity',
      value: 'LIQUIDITY'
    },
    {
      title: 'Fee',
      value: 'FEE'
    },
    {
      title: 'TVL',
      value: 'TVL'
    }
  ]

  const tabActive = ref<TabValue>(TabValue.VOLUME)
</script>

<style lang="scss" scoped></style>
