<template>
  <div>isPending: {{ isPending }}</div>
  <div>{{ data?.length }}</div>
</template>

<script lang="ts" setup>
  const chainIds = ref([16789])
  const { data, isPending } = useAccountV3Positions(chainIds)
</script>

<style lang="scss"></style>
