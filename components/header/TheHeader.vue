<template>
  <header class="flex h-[72px] items-center justify-between px-3">
    <div class="flex items-center gap-3">
      <img src="/logo.png" alt="logo" class="w-12" />
      <div class="grid grid-cols-3 gap-3 sm:hidden">
        <NuxtLink active-class="!text-primary" to="/" class="mx-2 text-base leading-6 text-secondary hover:text-primary">Home</NuxtLink>

        <ElPopover placement="bottom" :show-arrow="false" :width="180" trigger="hover" popper-class="popper-menu-pool" :teleported="false">
          <template #reference>
            <NuxtLink active-class="!text-primary" to="/positions" class="mx-2 text-base leading-6 text-secondary hover:text-primary">Pool</NuxtLink>
          </template>
          <div class="flex flex-col gap-1">
            <NuxtLink
              active-class="!text-primary"
              to="/positions"
              class="h-10 w-full rounded-xl bg-surface pl-2 text-base leading-10 text-secondary hover:bg-[#22222212] hover:text-primary"
              >View positions</NuxtLink
            >
            <NuxtLink
              active-class="!text-primary"
              to="/positions/create"
              class="h-10 w-full rounded-xl bg-surface pl-2 text-base leading-10 text-secondary hover:bg-[#22222212] hover:text-primary"
              >Create position</NuxtLink
            >
          </div>
        </ElPopover>
      </div>
      <ElPopover
        v-model:visible="visible"
        placement="bottom"
        :show-arrow="false"
        :width="300"
        trigger="click"
        popper-class="popper-menu-pool"
        :teleported="false"
      >
        <template #reference>
          <div class="hidden items-center space-x-1 sm:flex">
            <BaseIcon name="menu-bar" size="24" class="text-secondary" />
            <BaseIcon name="arrow-fill" size="12" class="text-secondary" />
          </div>
        </template>
        <div class="flex flex-col gap-1" @click="visible = false">
          <NuxtLink active-class="!text-primary" to="/positions" class="h-10 w-full rounded-xl pl-2 text-base leading-10 text-secondary">
            View positions
          </NuxtLink>
          <NuxtLink active-class="!text-primary" to="/positions/create" class="h-10 w-full rounded-xl pl-2 text-base leading-10 text-secondary">
            Create position
          </NuxtLink>
        </div>
      </ElPopover>
    </div>

    <ElPopover v-if="isLogged" placement="bottom" :show-arrow="false" :width="150" trigger="hover" popper-class="popper-menu-pool" :teleported="false">
      <template #reference>
        <div class="flex cursor-pointer items-center gap-1 rounded-full px-[6px] py-2 hover:bg-surface" @click="isOpen = true">
          <BaseIcon name="default-avatar" size="24" />
          <span>{{ sliceString(userAddress!, 6) }}</span>
        </div>
      </template>
      <div class="flex w-full items-center justify-between">
        <div
          class="flex w-full cursor-pointer items-center gap-1 overflow-hidden rounded-full bg-surface px-[6px] py-2 hover:bg-surface3"
          @click="
            () => {
              disconnectWallet()
              isOpen = false
            }
          "
        >
          <BaseIcon name="shutdown" size="20" class="text-secondary" />
          <span class="text-sm text-secondary">Disconnect</span>
        </div>
      </div>
    </ElPopover>

    <div v-else class="flex h-10 cursor-pointer items-center justify-center rounded-full bg-[#ffefff] px-3 hover:bg-[#ffe7ff]" @click="connectWallet">
      <span class="text-sm text-pink">Connect</span>
    </div>

    <!-- <ElDrawer
      v-model="isOpen"
      direction="rtl"
      :size="isDesktop ? '23%' : '100%'"
      header-class="!mb-0 !pt-2"
      :show-close="false"
      :with-header="false"
      :modal="true"
    >
      <template #header>
        <div class="flex items-center justify-end gap-2">
          <BaseIcon name="x" size="24" class="cursor-pointer text-secondary" @click="isOpen = false" />
          <span class="cursor-pointer text-sm text-secondary" @click="isOpen = false">Close</span>
        </div>
      </template>
      <div class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div class="flex cursor-pointer items-center gap-1 rounded-full px-[6px] py-2 hover:opacity-80" @click="isOpen = true">
            <BaseIcon name="default-avatar" size="28" />
            <span>{{ sliceString(userAddress!, 6) }}</span>
          </div>
          <div
            class="flex cursor-pointer items-center gap-1 overflow-hidden rounded-full bg-surface px-[6px] py-2 hover:bg-surface3"
            @click="
              () => {
                disconnectWallet()
                isOpen = false
              }
            "
          >
            <BaseIcon name="shutdown" size="20" class="text-secondary" />
            <span class="text-sm text-secondary">Disconnect</span>
          </div>
        </div>
        <span class="text-4xl font-medium">$0.23</span>
      </div>
    </ElDrawer> -->
  </header>
</template>

<script setup lang="ts">
  import BaseIcon from '../base/BaseIcon.vue'

  const { connectWallet, disconnectWallet } = useWeb3()
  const { isLogged, userAddress } = storeToRefs(useAuthStore())

  const isOpen = ref(false)
  const visible = ref(false)

  const isDesktop = ref(false)
  onMounted(() => {
    nextTick(() => {
      isDesktop.value = window.innerWidth > 768
    })
  })
</script>

<style scoped lang="scss">
  :deep(.popper-menu-pool) {
    --el-popover-border-radius: 16px;
    --el-popover-padding: 4px;
  }
  .transaction {
    transition:
      visibility 0s,
      opacity 0.5s linear;
  }
</style>
