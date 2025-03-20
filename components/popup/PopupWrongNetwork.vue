<template>
  <BasePopup
    name="popup-wrong-network"
    width="420"
    title="You are in wrong network"
    :is-show-footer="false"
    :close-click-modal="false"
    :close-press-escape="false"
  >
    <template #close><span></span></template>
    <div class="flex flex-col gap-5 px-8 pb-5 text-base">
      <span>This page is located for {{ networkLocated.name }}. </span>
      <span>You are under {{ currentNetwork?.name }} now, please switch the network to continue. </span>
      <img src="/wrong-network.png" alt="wrong network" class="mx-auto w-32" />
      <BaseButton :loading="isPending" size="md" class="text-base font-semibold" @click="switchChain">Switch to {{ networkLocated.name }}</BaseButton>
    </div>
  </BasePopup>
</template>

<script lang="ts" setup>
  import { useSwitchChain } from '@wagmi/vue'
  import * as allChains from 'viem/chains'
  import { DEFAULT_NETWORK } from '~/config/networks'

  const { networkLocated } = storeToRefs(useBaseStore())
  const { chainId } = useActiveChainId()

  const { isPending, switchChainAsync } = useSwitchChain()

  const currentNetwork = computed(() => {
    return Object.values(allChains).find((c) => c.id === chainId.value) ?? DEFAULT_NETWORK
  })

  const switchChain = async () => {
    await switchChainAsync({ chainId: networkLocated.value.chainId })
    window.location.reload()
  }
</script>

<style lang="scss" scoped></style>
