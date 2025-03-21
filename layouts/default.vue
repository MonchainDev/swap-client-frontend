<template>
  <div class="relative flex w-full flex-col bg-white">
    <PageLoading v-if="loading" class="z-10" />
    <TheHeader />
    <div class="flex flex-1 flex-col bg-[#F5F5F5]">
      <main>
        <slot />
      </main>
    </div>
    <TheFooter />
    <TheHeaderMobile />
    <PopupConnectWallet />
    <PopupWrongNetwork />
  </div>
</template>

<script lang="ts" setup>
  import PageLoading from '~/components/loading/PageLoading.vue'

  const loading = ref(true)

  onMounted(() => {
    loading.value = false
  })
</script>

<style lang="scss" scoped>
  main {
    background: url('/bg-body.png') repeat-x top;
  }
</style>
