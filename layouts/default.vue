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
      <PopupConnectWallet />
    </template>
  </div>
</template>

<script lang="ts" setup>
  import PageLoading from '~/components/loading/PageLoading.vue'
  import { NATIVE_TOKEN } from '~/constant'
  import { baseRepository } from '~/repository/base'

  const { listToken } = storeToRefs(useBaseStore())

  const { $fetch } = useNuxtApp()
  const apiBase = baseRepository($fetch)

  const { data } = await useAsyncData(() => apiBase.getListToken(), { server: true })
  listToken.value = [NATIVE_TOKEN, ...data.value!.items]

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
