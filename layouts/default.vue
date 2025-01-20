<template>
  <div class="w-full">
    <TheHeader />
    <main v-if="!loading">
      <slot />
    </main>
  </div>
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

  const { init } = useWeb3()

  onMounted(() => {
    init().then(() => {
      loading.value = false
    })
  })
</script>

<style lang="scss"></style>
