<template>
  <ClientOnly>
    <div v-if="status === 'pending'" v-loading="status === 'pending'" class="min-h-svh w-full"></div>
    <template v-if="data && status === 'success'">
      <div class="relative mx-auto mb-[42px] mt-[30px] max-w-[1024px] sm:mt-0 sm:px-4">
        <BlockHeaderLiquid :pool="data" />
        <BlockMyPosition class="mt-20 sm:mt-10" :pool="data" />
        <BlockPairInfo class="mt-[67px] sm:mt-12" :pool="data" />
        <TableTxPoolDetail :pool="data" />
        <div class="bg-linear-mb absolute left-0 top-0 hidden h-[100px] w-screen sm:block"></div>
      </div>
    </template>
  </ClientOnly>
</template>

<script lang="ts" setup>
  import type { IPool } from '~/types/pool.type'

  definePageMeta({
    middleware: ['reset-all-popup-middleware', 'reset-form-liquidity-middleware']
  })

  const { address: poolAddress, network } = useRoute('liquidity-pool-network-address').params

  const { data, status } = useFetch<IPool>(`/api/pool/get/${poolAddress.toLowerCase()}`, { query: { network: network?.toUpperCase() } })
</script>

<style lang="scss"></style>
