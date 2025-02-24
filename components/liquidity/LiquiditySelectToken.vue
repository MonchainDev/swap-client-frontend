<template>
  <div class="flex h-[55px] cursor-pointer items-center gap-[10px] rounded-lg bg-[#F3F8FF] px-8" @click="emit('selectToken')">
    <template v-if="isSelected">
      <img :src="token.icon_url || ''" alt="logo token" class="size-7 rounded-full" @error="handleImageError($event)" />
      <div class="flex flex-col">
        <div class="flex items-center gap-1">
          <div class="line-clamp-1 text-base font-semibold">{{ token.symbol }}</div>
          <BaseIcon name="arrow" :size="18" class="-rotate-90" />
        </div>
        <h4 class="line-clamp-1 text-xs text-[#6F6A79]">{{ token.name }}</h4>
      </div>
    </template>
    <template v-else>
      <img src="/empty-token.png" alt="empty token" class="size-9 sm:size-8" />
      <div class="flex items-center gap-1 text-gray-6">
        <span class="text-sm">Select a token</span>
        <BaseIcon name="arrow" size="18" class="-rotate-90 text-gray-6" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { IToken } from '~/types'
  import type { TYPE_SWAP } from '~/types/swap.type'

  interface IProps {
    isSelected: boolean
    type: TYPE_SWAP
    token: IToken
  }

  const _props = withDefaults(defineProps<IProps>(), {
    isSelected: false,
    type: 'BASE',
    token: () => ({}) as IToken
  })

  const emit = defineEmits<{
    selectToken: []
  }>()

  const { handleImageError } = useErrorImage()
</script>

<style lang="scss"></style>
