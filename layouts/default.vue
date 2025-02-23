<template>
  <div class="flex w-full flex-col bg-white">
    <PageLoading v-if="loading" />
    <template v-else>
      <TheHeader />
      <div class="flex flex-1 flex-col bg-[#F5F5F5]">
        <main>
          <slot />
        </main>
      </div>
      <TheFooter />
      <TheHeaderMobile />
    </template>
  </div>
  <PopupConnectWallet />
</template>

<script lang="ts" setup>
  import PageLoading from '~/components/loading/PageLoading.vue'
  import { baseRepository } from '~/repository/base'

  const { listToken } = storeToRefs(useBaseStore())

  const { $fetch } = useNuxtApp()
  const apiBase = baseRepository($fetch)

  const { data } = await useAsyncData(() => apiBase.getListToken(), { server: true })
  listToken.value = [...data.value!.items]
  console.log('🚀 ~ data:', data)

  const loading = ref(true)

  // const { init } = useWeb3()

  onMounted(() => {
    loading.value = false
    // init().then(() => {
    // })
  })
</script>

<style lang="scss" scoped>
  main {
    background: url('/bg-body.png') repeat-x top;
  }
</style>
