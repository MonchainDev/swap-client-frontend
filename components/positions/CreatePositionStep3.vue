<template>
  <div class="flex flex-col gap-6">
    <ShortInfoPair />
    <ShortInfoRange />
    <div class="border-base p-6">
      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-1">
          <span class="text-lg">Deposit tokens </span>
          <span class="text-sm text-secondary">Specify the token amounts for your liquidity contribution.</span>
        </div>
        <div class="flex flex-col gap-1">
          <div class="rounded-[20px] bg-surface2 p-4">
            <div class="flex py-2">
              <input v-model="form.amountDeposit0" type="text" class="flex-1 bg-transparent text-[36px] focus:outline-none" placeholder="0" />
              <div class="flex items-center gap-1 p-1">
                <img :src="form.token0.icon_url" alt="logo" class="size-7" @error="handleImageError($event)" />
                <span class="text-lg font-medium">{{ form.token0.symbol }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-secondary">$0</span>
              <div class="flex items-center gap-1 text-sm text-secondary">
                <span>{{ formatNumber(balance0) }} {{ form.token0.symbol }}</span>
                <span class="cursor-pointer rounded-full bg-surface3 p-1 text-xs">Max</span>
              </div>
            </div>
          </div>
          <div class="rounded-[20px] bg-surface2 p-4">
            <div class="flex py-2">
              <input v-model="form.amountDeposit1" type="text" class="flex-1 bg-transparent text-[36px] focus:outline-none" placeholder="0" />
              <div class="flex items-center gap-1 p-1">
                <img :src="form.token1.icon_url" alt="logo" class="size-7" @error="handleImageError($event)" />
                <span class="text-lg font-medium">{{ form.token1.symbol }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-secondary">$0</span>
              <div class="flex items-center gap-1 text-sm text-secondary">
                <span>{{ formatNumber(balance1) }} {{ form.token1.symbol }}</span>
                <span class="cursor-pointer rounded-full bg-surface3 p-1 text-xs">Max</span>
              </div>
            </div>
          </div>
        </div>
        <BaseButton :disabled="disabled" @click="emit('review')">Review</BaseButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { TYPE_SWAP } from '~/types/swap.type'

  const { form } = storeToRefs(usePositionStore())

  const { handleImageError } = useErrorImage()

  const emit = defineEmits<{
    review: []
  }>()

  const disabled = computed(() => {
    return !form.value.amountDeposit0 || !form.value.amountDeposit1
  })

  const balance0 = ref('0')
  const balance1 = ref('0')

  onMounted(() => {
    handleGetBalance('BASE')
    handleGetBalance('QUOTE')
  })

  const { getBalance } = useWeb3()

  const handleGetBalance = async (type: TYPE_SWAP) => {
    if (type === 'BASE') {
      const rs = await getBalance(form.value.token0)
      balance0.value = rs
    } else {
      const rs = await getBalance(form.value.token1)
      balance1.value = rs
    }
  }
</script>

<style lang="scss"></style>
