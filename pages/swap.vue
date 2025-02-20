<template>
  <div class="relative mb-[50px] mt-[92px] sm:mt-0 sm:px-4">
    <FormSwap class="relative z-10 mx-auto max-w-[581px]" />
    <div class="bg-linear absolute left-0 top-0 hidden h-[100px] w-screen sm:block"></div>
  </div>
</template>

<script lang="ts" setup>
  import { useAccount, useBalance } from '@wagmi/vue'

  useHead({
    title: 'Buy, sell & trade Mon and other top tokens'
  })

  const { address } = useAccount()

  // Fetch balance when connected
  const { data: _data } = useBalance(
    computed(() => ({
      address: address.value,
      watch: true // Auto-update on wallet changes
    }))
  )
</script>

<style scoped lang="scss">
  .bg-linear {
    background: linear-gradient(116deg, #5c2f64 24.35%, #092143 72.01%);
  }
</style>
