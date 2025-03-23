<template>
  <BasePopup name="popup-connect" :fullscreen="!isDesktop" width="540" title="Connect Wallet" class="popup-connect" @close="typeConnect = null">
    <template v-if="!isDesktop" #close>
      <BaseIcon name="arrow-down" size="24" class="rotate-90" @click="setOpenPopup('popup-connect', false)" />
    </template>
    <div class="px-8 sm:px-4">
      <h4 class="text-sm text-[#616161]">
        Start by connecting with one of the wallets below. Be sure to store your private keys or seed phrase securely. Never share them with anyone.
      </h4>
      <div class="mx-auto mt-8 flex max-w-[400px] justify-between pb-[62px] sm:mt-10">
        <div
          v-for="(item, key) in walletList"
          :key="key"
          class="group flex cursor-pointer flex-col items-center justify-center gap-3"
          @click="handleConnect(item.type)"
        >
          <img v-if="typeConnect !== item.type" :src="item.icon" :alt="item.name" class="size-16 sm:size-11" />
          <div v-if="typeConnect === item.type" class="flex size-16 items-center justify-center sm:size-11">
            <BaseLoadingButton class="!w-10 sm:!w-7" />
          </div>
          <span class="text-nowrap text-sm group-hover:text-hyperlink">{{ item.name }}</span>
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

  const walletList: { name: string; icon: string; type: WalletType }[] = [
    {
      name: 'MetaMask',
      icon: '/metamask.png',
      type: 'METAMASK'
    },
    {
      name: 'Trust Wallet',
      icon: '/trust-wallet.png',
      type: 'TRUST_WALLET'
    },
    {
      name: 'Coinbase Wallet',
      icon: '/coinbase.png',
      type: 'COINBASE'
    }
  ]

  const typeConnect = ref<WalletType | null>(null)
  const handleConnect = async (type: WalletType) => {
    try {
      typeConnect.value = type
      if (type === 'TRUST_WALLET') {
        if (window?.trustWallet) {
          const connector = connectors.find((item) => item.name === 'Trust Wallet')
          if (connector) {
            await connectAsync({ connector, chainId: chainId.value })
          }
        } else {
          window.open(`https://link.trustwallet.com/open_url?coin_id=60&url=${window.location.href}`, '_blank')
        }
      } else if (type === 'METAMASK') {
        if (window?.ethereum?._metamask) {
          await connectAsync({ connector: connectors[0], chainId: chainId.value })
        } else {
          window.open(`https://metamask.app.link/dapp/${window.location.href}`, '_blank')
        }
      } else if (type === 'COINBASE') {
        if (window?.coinbaseWalletExtension) {
          await connectAsync({ connector: connectors[1], chainId: chainId.value })
        } else {
          window.open(`https://go.cb-w.com/dapp?cb_url=${window.location.href}`, '_blank')
        }
      }
      // else {
      //   await connectAsync({ connector: connectors[2], chainId: chainId.value })
      // }
      setOpenPopup('popup-connect', false)
      typeConnect.value = null
    } catch (error) {
      typeConnect.value = null
    }
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
