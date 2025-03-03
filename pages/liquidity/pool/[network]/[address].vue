<template>
  <div>network: {{ route.params.network }}</div>
  <div>address: {{ route.params.address }}</div>
</template>

<script lang="ts" setup>
  const route = useRoute('liquidity-pool-network-address')
</script>

<style lang="scss"></style>
