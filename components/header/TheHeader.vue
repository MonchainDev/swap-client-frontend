<template>
  <header class="container h-[72px] sm:h-[95px]">
    <div class="flex h-full items-center justify-between sm:h-fit sm:pt-3">
      <div class="flex items-center">
        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="logo" class="w-12 sm:w-7" />
          <span class="text-[22px] font-semibold leading-7 sm:text-base sm:text-white">ORB</span>
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

      <div class="flex items-center gap-8 sm:gap-3">
        <div class="flex items-center gap-1">
          <BaseIcon name="flag-uk" size="24" class="sm:hidden" />
          <span class="hidden sm:block sm:text-sm sm:text-white">EN</span>
          <BaseIcon name="arrow" size="18" class="hidden -rotate-90 text-primary sm:block sm:text-white" />
        </div>
        <div class="flex items-center gap-1">
          <span class="font-semibold sm:text-sm sm:font-normal sm:text-white">
            <span class="text-[#757575] sm:hidden">Currency :</span>
            USD
          </span>
          <BaseIcon name="arrow" size="18" class="-rotate-90 text-primary sm:text-white" />
        </div>

        <template v-if="isSwapping">
          <div class="flex h-9 w-40 items-center justify-center gap-2 rounded-full bg-[#C7DDFF]">
            <BaseLoadingButton />
            <span class="text-sm font-medium text-primary">Waiting</span>
          </div>
        </template>

        <template v-else>
          <ElPopover
            v-if="isConnected"
            placement="bottom-end"
            :show-arrow="false"
            :width="200"
            trigger="hover"
            popper-class="popper-menu-pool"
            :teleported="false"
          >
            <template #reference>
              <div class="flex h-9 cursor-pointer items-center gap-4 rounded-full bg-[#EFEFFF] px-5 sm:bg-transparent sm:px-0" @click="isOpen = true">
                <div class="flex items-center gap-2">
                  <BaseIcon name="default-avatar" size="24" />
                  <div class="sm:text-sm sm:text-white">
                    <div class="font-semibold">
                      <span>Mainnet </span>
                      <span class="text-hyperlink">0.03134$</span>
                    </div>
                    <div class="hidden sm:block">{{ sliceString(address!, 2, 4) }}</div>
                  </div>
                </div>
                <span class="h-full w-[2px] bg-white sm:hidden"></span>
                <span class="font-semibold text-gray-7 sm:hidden">{{ sliceString(address!, 2, 4) }}</span>
              </div>
            </template>
            <div class="flex w-full items-center justify-between">
              <div
                class="bg-surface hover:bg-surface3 flex w-full cursor-pointer items-center gap-1 overflow-hidden rounded-full px-[6px] py-2"
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

          <div
            v-else
            class="flex h-9 w-40 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#EFEFFF] hover:opacity-80 sm:w-fit sm:bg-transparent"
            @click="connectWallet"
          >
            <BaseIcon name="wallet" size="24" class="text-[#616161] sm:hidden" />
            <span class="text-sm sm:text-white">Connect Wallet</span>
          </div>
        </template>
      </div>
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
  const { isSwapping } = storeToRefs(useSwapStore())
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const isOpen = ref(false)

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
  .container {
    @media screen and (max-width: 768px) {
      background: linear-gradient(116deg, #5c2f64 24.35%, #092143 72.01%);
    }
  }
</style>
