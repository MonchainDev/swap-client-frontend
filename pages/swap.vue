<template>
  <div class="mt-[92px]">
    <FormSwap class="mx-auto max-w-[581px]" />
  </div>
</template>

<script lang="ts" setup>
  import { useBalance, useAccount } from '@wagmi/vue'
  const { address } = useAccount()

  // Fetch balance when connected
  const { data: _data } = useBalance(
    computed(() => ({
      address: address.value,
      watch: true // Auto-update on wallet changes
    }))
  )
</script>

<style lang="scss"></style>
