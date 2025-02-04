<template>
  <div class="flex w-full flex-col bg-white">
    <TheHeader />

    <div v-if="!loading" class="flex flex-1 flex-col bg-[#F5F5F5]">
      <main>
        <slot />
      </main>
      <TheFooter />
    </div>
    <TheHeaderMobile />
  </div>
  <PopupConnectWallet />
</template>

<script lang="ts" setup>
  import { NATIVE_TOKEN } from '~/constant'
  import { baseRepository } from '~/repository/base'

  const { listToken } = storeToRefs(useBaseStore())

  const { $fetch } = useNuxtApp()
  const apiBase = baseRepository($fetch)

  const { data } = await useAsyncData(() => apiBase.getListToken(), { server: true })
  listToken.value = [NATIVE_TOKEN, ...data.value!.items]

  const loading = ref(true)

  // const { init } = useWeb3()

  onMounted(() => {
    loading.value = false
    // init().then(() => {
    // })
  })
</script>

<style lang="scss"></style>
