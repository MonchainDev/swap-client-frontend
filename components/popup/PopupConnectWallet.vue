<template>
  <BasePopup name="popup-connect" width="540" :fullscreen="!isDesktop" title="Connect Wallet" class="popup-connect" @close="typeConnect = null">
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
  import { useAccount, useConnect, useSwitchChain } from '@wagmi/vue'
  import { UserRejectedRequestError } from 'viem'
  import type { WalletType } from '~/types/connect.type'

  declare global {
    interface Window {
      trustWallet: unknown
    }
  }

  const { currentNetwork } = storeToRefs(useBaseStore())
  const { connectors, connectAsync } = useConnect()

  const isDesktop = useDesktop()

  const { setOpenPopup } = useBaseStore()
  const { chainId } = useAccount()

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
  const { switchChainAsync } = useSwitchChain()

  const typeConnect = ref<WalletType | null>(null)
  const handleConnect = async (type: WalletType) => {
    try {
      typeConnect.value = type
      if (type === 'TRUST_WALLET') {
        if (window?.trustWallet) {
          const connector = connectors.find((item) => item.name === 'Trust Wallet')
          if (connector) {
            await connectAsync({ connector, chainId: currentNetwork.value.chainId })
          }
        } else {
          window.open(`https://link.trustwallet.com/open_url?coin_id=60&url=${window.location.href}`, '_blank')
        }
      } else if (type === 'METAMASK') {
        const isInstalled1 = window?.ethereum?.isMetaMask && !window?.ethereum?.isTrust
        const isInstalled2 = window?.ethereum?.providers
          ? (window?.ethereum?.providers as { isMetaMask: boolean | undefined; isTrust: boolean | undefined }[]).some(
              (provider) => provider.isMetaMask && !provider.isTrust
            )
          : isInstalled1

        if (isInstalled1 && isInstalled2) {
          await connectAsync({ connector: connectors[0], chainId: currentNetwork.value.chainId })
        } else {
          window.open(`https://metamask.app.link/dapp/${window.location.href}`, '_blank')
        }
      } else if (type === 'COINBASE') {
        if (window?.CoinbaseWalletProvider) {
          await connectAsync({ connector: connectors[1], chainId: currentNetwork.value.chainId })
        } else {
          window.open(`https://go.cb-w.com/dapp?cb_url=${window.location.href}`, '_blank')
        }
      }

      if (chainId.value === currentNetwork.value.chainId) {
        setOpenPopup('popup-connect', false)
        typeConnect.value = null
        return
      }
      await switchChainAsync({ chainId: currentNetwork.value.chainId })
      setOpenPopup('popup-connect', false)
      typeConnect.value = null
    } catch (error) {
      // case user accept request but throw error in coinbase wallet
      if (error instanceof UserRejectedRequestError && error.code === 4001 && type === 'COINBASE') {
        setOpenPopup('popup-connect', false)
      }
      typeConnect.value = null
    }
  }
</script>

<style lang="scss"></style>
