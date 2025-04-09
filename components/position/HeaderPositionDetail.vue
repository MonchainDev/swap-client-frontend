<template>
  <div class="grid grid-cols-2 gap-10 sm:relative sm:z-10 sm:grid-cols-1 sm:gap-4 sm:rounded-lg sm:bg-white sm:px-4 sm:pb-7 sm:pt-[10px]">
    <div class="flex items-center justify-between">
      <div class="flex gap-4 sm:gap-3">
        <NuxtLink
          to="/liquidity/positions"
          class="flex size-10 items-center justify-center rounded-lg border border-solid border-gray-3 bg-white sm:border-none"
        >
          <BaseIcon name="arrow-down" size="24" class="rotate-90" />
        </NuxtLink>
        <div class="flex flex-col gap-3 sm:gap-0">
          <div class="flex items-center gap-[9px] text-xl font-semibold">
            <span class="sm:hidden">Liquidity Pools & Farms /</span>
            <div class="flex">
              <img src="/token-default.png" alt="token " class="size-[25px] rounded-full border border-solid border-white sm:size-8" />
              <img src="/token-default.png" alt="token " class="-ml-4 size-[25px] rounded-full border border-solid border-white sm:size-8" />
            </div>
            <div>
              <span>{{ currencyQuote?.symbol }} + {{ currencyBase?.symbol }}</span>
              <div class="hidden items-center gap-1 text-xs text-gray-8 sm:flex">
                <img :src="networkOfPool?.logo" alt="logo" class="size-3" />
                <span>{{ networkOfPool?.name }}</span>
              </div>
            </div>
          </div>
          <div class="text-sm sm:hidden">
            <span class="text-[#049C6B]">Active</span>
            <span class="px-2 text-gray-4">|</span>
            <span>#{{ tokenId?.toString() }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-6 sm:grid sm:grid-cols-4 sm:gap-6">
      <div class="flex gap-10 sm:col-span-1">
        <div class="flex flex-col gap-[6px]">
          <span class="text-sm">Fee tier</span>
          <span class="text-xl font-semibold">{{ formatFee }}</span>
        </div>
        <div class="flex flex-col gap-[6px] sm:hidden">
          <span class="text-sm">Network</span>
          <div class="flex items-center gap-[10px] text-xl font-semibold">
            <img :src="networkOfPool?.logo" alt="logo" class="size-5" />
            <span>{{ networkOfPool?.name }}</span>
          </div>
        </div>
      </div>
      <div class="hidden gap-10 sm:col-span-3 sm:flex">
        <div class="flex flex-col gap-[6px]">
          <span class="flex items-center gap-1 text-sm">
            <BaseIcon name="calculator" size="14" class="text-gray-4" />
            <span>APR</span>
          </span>
          <span class="text-xl font-semibold">
            <span class="flex gap-2">
              <span class="text-success">Up to {{ feeApr ?? 0 }}% </span>
              <span>{{ rewardApr ?? 0 }}%</span>
            </span>
          </span>
        </div>
      </div>
      <div class="flex gap-2 sm:col-span-4">
        <BaseButton
          type="outline"
          :disabled="!isConnected || !isOwner"
          size="md"
          class="flex w-[95px] items-center justify-center !gap-0 !bg-white text-xl sm:flex-1"
          @click="emit('add-liquid')"
        >
          <BaseIcon name="plus" size="20" class="text-hyperlink" />
          <span class="text-hyperlink">Add</span>
        </BaseButton>

        <BaseButton :disabled="!isConnected || !isOwner" type="outline" size="md" class="w-[120px] !bg-white text-xl sm:flex-1">
          <NuxtLink :to="{ name: 'remove-network-tokenId', params: { network: route.params.network, tokenId: route.params.tokenId } }">
            <span class="text-hyperlink">Remove</span>
          </NuxtLink>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Currency, Token } from '@monchain/swap-sdk-core'
  import { LIST_NETWORK } from '~/config/networks'

  interface IProps {
    currencyQuote: Token | undefined | Currency
    currencyBase: Token | undefined | Currency
    formatFee: string
    isConnected: boolean
    isOwner: boolean
    feeApr: number | undefined
    rewardApr: number | undefined
  }

  const _props = withDefaults(defineProps<IProps>(), {
    currencyQuote: undefined,
    currencyBase: undefined,
    formatFee: '',
    isConnected: false,
    isOwner: false,
    feeApr: undefined,
    rewardApr: undefined
  })

  const emit = defineEmits<{
    'add-liquid': []
  }>()

  const route = useRoute('liquidity-network-tokenId')

  const networkOfPool = computed(() => {
    const networkUrl = route.params.network
    return LIST_NETWORK.find((item) => item.network.toUpperCase() === networkUrl.toUpperCase())
  })

  const tokenId = computed(() => {
    return route.params.tokenId ? BigInt(route.params.tokenId) : undefined
  })
</script>

<style lang="scss" scoped></style>
