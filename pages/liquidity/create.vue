<template>
  <div class="mt-10 bg-[#f5f5f5]">
    <div class="mx-auto max-w-[581px] rounded-lg bg-white px-8 py-[21px] shadow-sm">
      <div class="flex items-center justify-between">
        <h4 class="text-2xl font-semibold leading-7">Step 1: Select pair</h4>
        <ChooseNetwork />
      </div>
      <p class="max-w-[386px] text-sm text-gray-8">Choose the tokens you want to provide liquidity for. You can select tokens on all supported networks.</p>
      <div class="mt-4 grid grid-cols-2 gap-[21px]">
        <div class="flex h-[55px] items-center gap-[10px] rounded-lg bg-[#F3F8FF] px-8">
          <img :src="form.token0.icon_url" alt="logo token" class="size-7 rounded-full" />
          <div class="flex flex-col">
            <div class="flex items-center gap-1">
              <span class="text-base font-semibold">{{ form.token0.name }}</span>
              <BaseIcon name="arrow" :size="18" class="-rotate-90" />
            </div>
            <h4 class="line-clamp-1 text-xs text-[#6F6A79]">{{ form.token0.name }}</h4>
          </div>
        </div>
        <div class="flex h-[55px] items-center gap-[10px] rounded-lg bg-[#F3F8FF] px-8">
          <template v-if="form.token1.symbol">
            <img :src="form.token1.icon_url" alt="logo token" class="size-7 rounded-full" />
            <div class="flex flex-col">
              <div class="flex items-center gap-1">
                <span class="text-base font-semibold">{{ form.token0.name }}</span>
                <BaseIcon name="arrow" :size="18" class="-rotate-90" />
              </div>
              <h4 class="line-clamp-1 text-xs text-[#6F6A79]">{{ form.token0.name }}</h4>
            </div>
          </template>
          <template v-else>
            <img src="/empty-token.png" alt="empty token" class="size-9 sm:size-8" />
            <div class="flex items-center gap-1 text-gray-6">
              <span>Select a token</span>
              <BaseIcon name="arrow" size="18" class="-rotate-90 text-gray-6" />
            </div>
          </template>
        </div>
      </div>
      <div class="mt-8">
        <h4 class="text-2xl font-semibold leading-7">Fee tier</h4>
        <p class="mt-1 text-sm text-gray-8">The amount earned providing liquidity. Choose an amount that suits your risk tolerance and strategy.</p>
        <div class="mt-4 rounded-lg border border-dashed border-gray-6 px-[30px] pb-[33px] pt-[18px]">
          <div class="flex items-center justify-between">
            <span class="text-sm leading-5">The % you will earn in fees</span>
            <span class="text-sm font-bold leading-5">{{ form.feeTier }}%</span>
          </div>
          <div class="mt-7 grid grid-cols-[repeat(4,100px)] gap-4">
            <div v-for="item in listFee" :key="item.value" class="rounded-lg bg-[#fafafa] px-[13px] pb-[26px] pt-[15px]">
              <div class="flex items-center gap-[6px]">
                <BaseIcon name="radio" size="24" />
                <span class="text-sm font-bold leading-5">{{ item.value }}%</span>
              </div>
              <p class="mt-5 text-xs text-gray-8">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
      <button
        class="bg-linear mt-5 flex h-[67px] w-full items-center justify-center gap-2 rounded-lg text-xl font-semibold uppercase text-white hover:opacity-90 sm:h-[42px] sm:text-sm"
      >
        Continue
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const { form } = storeToRefs(useLiquidityStore())

  const listFee = [
    {
      value: 0.01,
      description: 'Best for very stable pairs.'
    },
    {
      value: 0.05,
      description: 'Best for stable pairs.'
    },
    {
      value: 0.3,
      description: 'Best for most pairs.'
    },
    {
      value: 1,
      description: 'Best for exotic pairs.'
    }
  ]
</script>

<style lang="scss" scoped>
  .bg-linear {
    background: linear-gradient(91deg, #790c8b 17.53%, #1573fe 84.87%);
  }
</style>
