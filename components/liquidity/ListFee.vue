<template>
  <div class="mt-8">
    <h4 class="text-lg font-semibold leading-7">Fee tier</h4>
    <div class="mt-4 grid grid-cols-[repeat(4,100px)] gap-5">
      <div
        v-for="item in LIST_FEE_AMOUNT"
        :key="item.value"
        class="cursor-pointer rounded-lg border border-solid border-gray-3 bg-[#fafafa] px-[13px] pb-[26px] pt-[15px]"
        @click="handleSelectFee(item)"
      >
        <div class="flex items-center gap-[6px]">
          <BaseIcon v-show="feeAmount === item.value" name="radio-fill" size="24" />
          <BaseIcon v-show="feeAmount !== item.value" name="radio" size="24" />
          <span class="text-sm font-bold leading-5">{{ item.value / 10000 }}%</span>
        </div>
        <p class="mt-5 text-xs text-gray-8">{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import ABI from '@/constant/abi/MonFactory.json'
  import { readContract } from '@wagmi/core'
  import { config } from '~/config/wagmi'
  import { LIST_FEE_AMOUNT } from '~/constant'
  import { CONTRACT_ADDRESS } from '~/constant/contract'

  const { feeAmount, baseCurrency, quoteCurrency } = storeToRefs(useLiquidityStore())
  const { resetFiled } = useLiquidityStore()

  // const { data, refetch } = useReadContract({
  //   abi: ABI,
  //   address: CONTRACT_ADDRESS.MON_FACTORY as `0x${string}`,
  //   functionName: 'getPool',
  //   args: [baseCurrency.value?.wrapped.address, quoteCurrency.value?.wrapped.address, feeAmount]
  // })

  const handleSelectFee = async (item: { value: number }) => {
    if (baseCurrency.value?.wrapped.address && quoteCurrency.value?.wrapped.address) {
      const result = await readContract(config, {
        abi: ABI,
        address: CONTRACT_ADDRESS.MON_FACTORY as `0x${string}`,
        functionName: 'getPool',
        args: [baseCurrency.value?.wrapped.address, quoteCurrency.value?.wrapped.address, item.value]
      })
      if (result === '0x0000000000000000000000000000000000000000') {
        // pool is not create
        feeAmount.value = item.value
      } else {
        // pool is created
        resetFiled()
        feeAmount.value = item.value
      }
    }
  }
</script>

<style lang="scss"></style>
