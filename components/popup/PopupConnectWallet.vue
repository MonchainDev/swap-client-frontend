<template>
  <BasePopup name="popup-connect" :fullscreen="!isDesktop" width="540" title="Connect Wallet" class="popup-connect">
    <template v-if="!isDesktop" #close>
      <BaseIcon name="arrow-down" size="24" class="rotate-90" @click="setOpenPopup('popup-connect', false)" />
    </template>
    <div class="px-8 sm:px-4">
      <h4 class="text-sm text-[#616161]">
        Start by connecting with one of the wallets below. Be sure to store your private keys or seed phrase securely. Never share them with anyone.
      </h4>
      <div class="mx-auto mt-8 grid max-w-[400px] grid-cols-3 pb-[62px] sm:mt-10 sm:gap-10">
        <div class="group flex cursor-pointer flex-col items-center justify-center gap-3" @click="handleConnect('METAMASK')">
          <img src="/metamask.png" alt="metamask" class="size-16 sm:size-11" />
          <span class="text-sm group-hover:text-hyperlink">MetaMask</span>
        </div>
        <div class="group flex cursor-pointer flex-col items-center justify-center gap-3" @click="handleConnect('TRUST_WALLET')">
          <img src="/trust-wallet.png" alt="trust wallet" class="size-16 sm:size-11" />
          <span class="text-sm group-hover:text-hyperlink">Trust Wallet</span>
        </div>
        <div class="group flex cursor-pointer flex-col items-center justify-center gap-3" @click="handleConnect('COINBASE')">
          <img src="/coinbase.png" alt="coinbase" class="size-16 sm:size-11" />
          <span class="text-nowrap text-sm group-hover:text-hyperlink">Coinbase Wallet</span>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script lang="ts" setup>
  import { useChainId, useConnect } from '@wagmi/vue'
  import type { WalletType } from '~/types/connect.type'

  declare global {
    interface Window {
      trustWallet: unknown
    }
  }

  const { isDesktop } = storeToRefs(useBaseStore())
  const { connectors, connectAsync } = useConnect()
  const chainId = useChainId()

  const { setOpenPopup } = useBaseStore()

  const handleConnect = async (type: WalletType) => {
    if (type === 'TRUST_WALLET') {
      if (!window.trustWallet) {
        ElMessage.error('Trust wallet not found')
      } else {
        const connector = connectors.find((item) => item.name === 'Trust Wallet')
        if (connector) {
          await connectAsync({ connector, chainId: chainId.value })
        }
      }
    } else if (type === 'METAMASK') {
      await connectAsync({ connector: connectors[0], chainId: chainId.value })
    } else {
      await connectAsync({ connector: connectors[1], chainId: chainId.value })
    }
    setOpenPopup('popup-connect', false)
  }
</script>

<style lang="scss">
  .popup-connect {
    @apply sm:!max-w-full;
    .wrap-header {
      @apply sm:w-fit sm:flex-row-reverse sm:gap-2;
    }
  }
</style>
