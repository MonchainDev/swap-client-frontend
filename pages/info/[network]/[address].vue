<template>
  <div v-if="status === 'pending'" v-loading="status === 'pending'" class="min-h-svh w-full" />
  <template v-if="data && status === 'success'">
    <div class="mx-auto mb-[42px] mt-[30px] max-w-[1024px]">
      <BlockHeaderLiquid :pool="data" />
      <BlockPairInfo class="mt-[37px]" :show-header="false" :pool="data" />
      <TableTxPoolDetail :pool="data" />
    </div>
  </template>
</template>

<script lang="ts" setup>
  import type { IPool } from '~/types/pool.type'

  definePageMeta({
    middleware: ['reset-all-popup-middleware', 'reset-form-liquidity-middleware']
  })

  const { address: poolAddress, network } = useRoute('info-network-address').params

  const { data, status } = useFetch<IPool>(`/api/pool/get/${poolAddress}`, { query: { network: network?.toUpperCase() } })
</script>

<style lang="scss" scoped></style>
