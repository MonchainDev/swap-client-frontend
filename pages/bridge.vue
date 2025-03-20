<template>
  <div class="relative mb-[50px] mt-[92px] sm:mt-0 sm:px-4">
    <client-only>
      <FormBridgeClient class="relative z-10 mx-auto max-w-[581px]" />
    </client-only>
    <div class="bg-linear absolute left-0 top-0 hidden h-[100px] w-screen sm:block"></div>
  </div>
</template>

<script lang="ts" setup>
  import { useAccount, useBalance } from '@wagmi/vue'
  import FormBridgeClient from '~/components/bridge/FormBridge.client.vue'
  import type { NetworkConfig } from '~/types/bridge.type'

  const { address } = useAccount()

  // Fetch balance when connected
  const { data: _data } = useBalance(
    computed(() => ({
      address: address.value,
      watch: true // Auto-update on wallet changes
    }))
  )

  // const { data } = useFetch<NetworkConfig[]>(`/api/network/all`)
  // const { listNetwork } = storeToRefs(useBridgeStore())
  // listNetwork.value = data.value || []
</script>

<style scoped lang="scss">
  .bg-linear {
    background: linear-gradient(116deg, #5c2f64 24.35%, #092143 72.01%);
  }
</style>
