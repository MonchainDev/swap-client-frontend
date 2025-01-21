<template>
  <BasePopup name="popup-review-position" width="420" title="Creating position">
    <div class="px-4 pb-4">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-2xl text-primary">{{ form.token0.symbol }} / {{ form.token1.symbol }}</span>
            <span class="w-fit rounded bg-surface px-[6px] py-[2px] text-xs font-medium text-secondary">{{ form.feeTier }}%</span>
          </div>
          <img :src="form.token0.icon_url" alt="logo" class="size-9" @error="handleImageError($event)" />
        </div>
        <div class="grid grid-cols-2 gap-5">
          <div class="flex flex-col gap-2">
            <span class="text-sm text-secondary">Min</span>
            <span class="text-sm text-primary">{{ form.minPrice }} {{ form.token1.symbol }}/{{ form.token0.symbol }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-sm text-secondary">Max</span>
            <span class="text-sm text-primary">{{ form.maxPrice }} {{ form.token1.symbol }}/{{ form.token0.symbol }}</span>
          </div>
        </div>
      </div>
      <div class="mt-8 flex flex-col gap-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex flex-1 flex-col gap-1">
            <span class="text-sm text-secondary">Depositing</span>
            <span class="text-lg text-primary">{{ form.amountDeposit0 }} {{ form.token0.symbol }}</span>
            <span class="text-sm text-secondary">$0</span>
          </div>
          <img :src="form.token0.icon_url" alt="logo" class="size-9" @error="handleImageError($event)" />
        </div>
        <div class="flex items-center justify-between gap-2">
          <div class="flex flex-1 flex-col gap-1">
            <span class="text-lg text-primary">{{ form.amountDeposit1 }} {{ form.token1.symbol }}</span>
            <span class="text-sm text-secondary">$0</span>
          </div>
          <img :src="form.token1.icon_url" alt="logo" class="size-9" @error="handleImageError($event)" />
        </div>
      </div>
      <div class="my-6 h-[1px] w-full">
        <div class="h-full bg-surface3"></div>
      </div>

      <template v-if="loading">
        <ul class="flex flex-col gap-2 text-sm">
          <li class="flex items-center gap-3" :class="{ 'opacity-60': step !== 1 }">
            <div class="relative size-6">
              <div class="pulse absolute hidden size-6 rounded-full border border-solid border-[#7c7c82]" :class="{ '!block': step === 1 }"></div>
              <img :src="WRAPPED_NATIVE_TOKEN.icon_url" alt="logo" class="size-6" @error="handleImageError($event)" />
            </div>
            <span>Approve in wallet</span>
          </li>
          <li class="ml-3 h-[10px] w-[2px] bg-neutral3"></li>
          <li class="flex items-center gap-3" :class="{ 'opacity-60': step !== 2 }">
            <div class="relative size-6">
              <div class="pulse absolute hidden size-6 rounded-full border border-solid border-[#7c7c82]" :class="{ '!block': step === 2 }"></div>
              <img :src="tokenRemain.icon_url" alt="logo" class="size-6" @error="handleImageError($event)" />
            </div>
            <span>Approve {{ tokenRemain.symbol }} spending</span>
          </li>
          <li class="ml-3 h-[10px] w-[2px] bg-neutral3"></li>
          <li class="flex items-center gap-3" :class="{ 'opacity-60': step !== 3 }">
            <div class="relative size-6">
              <div class="pulse absolute hidden size-6 rounded-full border border-solid border-[#7c7c82]" :class="{ '!block': step === 3 }"></div>
              <div class="flex size-6 items-center justify-center rounded-full bg-neutral3">
                <BaseIcon name="arrow-two-way" size="12" />
              </div>
            </div>
            <span>Confirm in wallet</span>
          </li>
        </ul>
      </template>
      <template v-else>
        <div class="flex items-center justify-between text-sm text-secondary">
          <span>Network cost </span>
          <span class="text-primary">$100.10</span>
        </div>
        <BaseButton class="mt-6 flex w-full items-center space-x-1 text-lg" @click="handleCreate">
          <BaseLoadingButton v-if="loading" />
          <span>Create</span>
        </BaseButton>
      </template>
    </div>
  </BasePopup>
</template>

<script lang="ts" setup>
  import { WRAPPED_NATIVE_TOKEN } from '~/constant'

  const { form } = storeToRefs(usePositionStore())
  const { handleImageError } = useErrorImage()
  const step = ref(1)

  const isIncludeNativeToken = computed(() => form.value.token0.address === '' || form.value.token1.address === '')

  const tokenRemain = computed(() => (form.value.token0.address === '' ? form.value.token1 : form.value.token0))

  /**
   * * Handle create position
   * STEP 1: check if the token is native token
   * STEP 2: if the token is native token, check allowance and show the approve wrapped token
   * STEP 3: after approve wrapped token, check allowance and show the approve token
   * STEP 4: after approve token, create position
   */
  const loading = ref(false)
  const { approveToken, createPool } = useWeb3()

  const handleCreate = async () => {
    try {
      loading.value = true
      step.value = 1
      if (isIncludeNativeToken.value) {
        await approveToken(WRAPPED_NATIVE_TOKEN)
        step.value = 2
        await approveToken(tokenRemain.value)
        step.value = 3
        await createPool(WRAPPED_NATIVE_TOKEN, tokenRemain.value, form.value)
      } else {
        await approveToken(form.value.token0)
        step.value = 2
        await approveToken(form.value.token1)
        step.value = 3
        await createPool(WRAPPED_NATIVE_TOKEN, tokenRemain.value, form.value)
      }
      loading.value = false
    } catch (error) {
      console.log('🚀 ~ handleCreate ~ error:', error)
      loading.value = false
      step.value = 1
    }
  }
</script>

<style lang="scss" scoped>
  .pulse {
    animation: 1s linear 0s infinite normal none running pulse;
  }

  @keyframes pulse {
    from {
      transform: scale(1);
      opacity: 1;
    }

    to {
      transform: scale(1.5);
      opacity: 0;
    }
  }
</style>
