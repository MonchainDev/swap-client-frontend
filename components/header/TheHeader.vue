<template>
  <header class="container flex h-[72px] items-center justify-between">
    <div class="flex items-center">
      <div class="flex items-center gap-2">
        <img src="/logo.png" alt="logo" class="w-12" />
        <span class="text-[22px] font-semibold leading-7">ORB</span>
      </div>
      <div class="ml-[68px] flex items-center gap-8 sm:hidden">
        <NuxtLink active-class="active-menu" to="/" class="text-center text-base font-medium leading-6 hover:text-primary">Home</NuxtLink>
        <NuxtLink active-class="active-menu" to="/swap" class="text-center text-base font-medium leading-6 hover:text-primary">Swap</NuxtLink>
        <div active-class="active-menu" to="/swap" class="text-center text-base font-medium leading-6 hover:text-primary">Cross chain</div>
        <div active-class="active-menu" to="/swap" class="text-center text-base font-medium leading-6 hover:text-primary">Add Liquidity</div>
        <div active-class="active-menu" to="/swap" class="text-center text-base font-medium leading-6 hover:text-primary">Farming</div>
        <div active-class="active-menu" to="/swap" class="text-center text-base font-medium leading-6 hover:text-primary">Bridge</div>
      </div>
    </div>

    <ElPopover v-if="isConnected" placement="bottom" :show-arrow="false" :width="200" trigger="hover" popper-class="popper-menu-pool" :teleported="false">
      <template #reference>
        <div class="flex h-9 cursor-pointer items-center gap-4 rounded-full bg-[#EFEFFF] px-5" @click="isOpen = true">
          <div class="flex items-center gap-2">
            <BaseIcon name="default-avatar" size="24" />
            <span>Mainnet <span class="text-hyperlink">0.03134$</span></span>
          </div>
          <span class="h-full w-[2px] bg-white"></span>
          <span>{{ sliceString(address!, 2, 4) }}</span>
        </div>
      </template>
      <div class="flex w-full items-center justify-between">
        <div
          class="flex w-full cursor-pointer items-center gap-1 overflow-hidden rounded-full bg-surface px-[6px] py-2 hover:bg-surface3"
          @click="
            () => {
              disconnect()
              isOpen = false
            }
          "
        >
          <BaseIcon name="shutdown" size="20" class="text-primary" />
          <span class="text-sm text-primary">Disconnect</span>
        </div>
      </div>
    </ElPopover>

    <div v-else class="flex h-9 w-40 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#EFEFFF] hover:opacity-80" @click="connectWallet">
      <BaseIcon name="wallet" size="24" class="text-[#616161]" />
      <span class="text-sm">Connect Wallet</span>
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
  import { useAccount, useDisconnect } from '@wagmi/vue'

  const { setOpenPopup } = useBaseStore()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const isOpen = ref(false)

  const isDesktop = ref(false)
  onMounted(() => {
    nextTick(() => {
      isDesktop.value = window.innerWidth > 768
    })
  })

  const connectWallet = () => {
    setOpenPopup('popup-connect')
  }
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

  .active-menu {
    padding: 6px 26px;
    border-radius: 32px;
    background: #e3eeff;
  }
</style>
