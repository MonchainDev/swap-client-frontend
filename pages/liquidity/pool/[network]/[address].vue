<template>
  <div v-if="status === 'pending'" v-loading="status === 'pending'" class="min-h-svh w-full"></div>
  <template v-if="data && status === 'success'">
    <div class="mx-auto mb-[42px] mt-[30px] max-w-[1024px]">
      <BlockHeaderLiquid :pool="data" />
      <BlockMyPosition class="mt-20" :pool="data" />
      <BlockPairInfo class="mt-[67px]" :pool="data" />
      <TableTxPoolDetail />
    </div>
  </template>
</template>

<script lang="ts" setup>
  import type { IPool } from '~/types/pool.type'

  const { address: poolAddress, network } = useRoute('liquidity-pool-network-address').params

  const { data, status } = useFetch<IPool>(`/api/pool/get/${poolAddress}`, { query: { network: network?.toUpperCase() } })
</script>

<style lang="scss"></style>
