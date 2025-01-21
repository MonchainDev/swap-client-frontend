<template>
  <BasePopup name="popup-review-swap" width="420" title="You’re swapping" size-icon-close="20" class-show-close="text-secondary" @close="isOpen = false">
    <template #title>
      <span class="pl-[6px] text-base text-secondary">You’re swapping</span>
    </template>
    <template #close>
      <BaseIcon name="x" class="cursor-pointer pr-[6px] text-secondary" size="20" @click="setOpenPopup('popup-review-swap', false)" />
    </template>
    <div class="px-6 pb-6">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-2xl font-medium">{{ sellAmount }} {{ token0.symbol }}</span>
            <span class="text-base text-secondary">-</span>
          </div>
          <img :src="token0.icon_url" alt="token logo" class="size-10" @error="handleImageError($event)" />
        </div>
        <BaseIcon name="arrow-down" class="text-neutral3" size="20" />
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-2xl font-medium">{{ buyAmount }} {{ token1.symbol }}</span>
            <span class="text-base text-secondary">-</span>
          </div>
          <img :src="token1.icon_url" alt="token logo" class="size-10" @error="handleImageError($event)" />
        </div>
      </div>
      <div class="my-6 flex items-center gap-4">
        <div class="h-[1px] flex-1 bg-surface3"></div>
        <span class="flex cursor-pointer items-center gap-[2px] text-sm text-neutral3" @click="isOpen = !isOpen">
          <span>{{ isOpen ? 'Show less' : 'Show more' }}</span>
          <BaseIcon :name="isOpen ? 'show-less' : 'show-more'" size="20" />
        </span>
        <div class="h-[1px] flex-1 bg-surface3"></div>
      </div>
      <div class="flex flex-col gap-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-secondary">Fee (0.25%)</span>
          <span>100 {{ token1.symbol }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-secondary">Network cost</span>
          <span>0.004 ETH</span>
        </div>
        <template v-if="isOpen">
          <div class="flex items-center justify-between">
            <span class="text-secondary">Rate</span>
            <span>1 {{ token0.symbol }} = {{ Math.floor(Math.random() * 144) }} {{ token1.symbol }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-secondary">Max slippage </span>
            <span>{{ slippage }}%</span>
          </div>
        </template>
      </div>

      <BaseButton size="md" class="mt-6 w-full text-lg" @click="handleSwap">Swap</BaseButton>
    </div>
  </BasePopup>
</template>

<script lang="ts" setup>
  import type { IToken } from '~/types'

  interface IProps {
    sellAmount: string
    buyAmount: string
    token0: IToken
    token1: IToken
    slippage?: number
  }

  const _props = withDefaults(defineProps<IProps>(), {
    sellAmount: '',
    buyAmount: '',
    token0: () => ({
      name: '',
      symbol: '',
      decimals: 0,
      icon_url: '',
      address: ''
    }),
    token1: () => ({
      name: '',
      symbol: '',
      decimals: 0,
      icon_url: '',
      address: ''
    }),
    slippage: 0.5
  })

  const { setOpenPopup } = useBaseStore()

  const { handleImageError } = useErrorImage()

  const isOpen = ref(false)

  const { approveToken } = useWeb3()
  const handleSwap = async () => {
    const rs = await approveToken(_props.token1)
    console.log('🚀 ~ handleSwap ~ rs:', rs)
  }
</script>

<style lang="scss"></style>
