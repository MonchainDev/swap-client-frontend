<template>
  <ElDrawer v-model="drawer" direction="btt" :show-close="false" size="370" class="drawer-liquid rounded-tl-md rounded-tr-md shadow">
    <template #header>
      <div class="flex gap-[10px]">
        <div class="flex">
          <img src="/token-default.png" alt="logo" class="size-9" />
          <img src="/token-default.png" alt="logo" class="-ml-[18px] size-9" />
        </div>
        <div v-if="poolDetail" class="flex flex-1 flex-col">
          <span class="text-base font-semibold text-primary">{{ poolDetail?.baseSymbol }} / {{ poolDetail.quoteSymbol }}</span>
          <div class="flex items-center gap-1">
            <img :src="getNetwork(poolDetail.network)?.logo" alt="logo" class="h-[14px] w-[14px]" />
            <span class="text-xs text-gray-8">{{ getNetwork(poolDetail.network)?.name }}</span>
          </div>
        </div>
      </div>
      <BaseIcon name="x" size="24" class="cursor-pointer text-primary" @click="drawer = false" />
    </template>
    <template #default>
      <div v-if="poolDetail" class="px-4 py-5">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm text-primary">APR</p>
          <div class="flex items-center gap-1">
            <div class="border-b border-dashed border-[#D9D9D9] text-sm font-bold text-[#049C6B]">Up to {{ Number(poolDetail.feeApr).toFixed(2) }}%</div>
            <div class="font-semibold text-gray-6">{{ poolDetail.rewardApr }}%</div>
          </div>
        </div>
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm text-primary">Fee tier</p>
          <div class="flex h-5 w-[55px] items-center justify-center rounded-sm bg-[#F5F5F5] text-xs font-semibold">{{ poolDetail?.fee / 10000 }}%</div>
        </div>
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm text-primary">TVL</p>
          <p class="text-sm font-medium text-primary">${{ formatDollar(poolDetail.tvl) }}</p>
        </div>
        <div class="flex items-center justify-between border-b border-dashed border-[#D9D9D9] pb-4">
          <p class="text-sm text-primary">Volume 24h</p>
          <p class="text-sm font-medium text-primary">${{ formatDollar(poolDetail.volume24h) }}</p>
        </div>
        <NuxtLink
          v-if="poolDetail"
          :to="{ name: 'liquidity-pool-network-address', params: { network: poolDetail.network, address: poolDetail.poolAddress } }"
          class="mt-3 flex items-center gap-2"
        >
          <BaseIcon name="info" size="20" class="cursor-pointer" />
          <p class="text-base text-primary">View pool details</p>
        </NuxtLink>
        <div v-if="!isConnected" class="mt-3 flex items-center gap-2" @click="setOpenPopup('popup-connect', true)">
          <BaseIcon name="wallet-1" size="20" class="cursor-pointer" />
          <p class="text-base text-primary">Connect Wallet</p>
        </div>
        <NuxtLink
          v-if="poolDetail"
          :to="{ name: 'info-network-address', params: { network: poolDetail.network, address: poolDetail.poolAddress } }"
          class="mt-3 flex items-center gap-2"
        >
          <BaseIcon name="article" size="20" class="cursor-pointer" />
          <p class="text-base text-primary">View Info page</p>
        </NuxtLink>
      </div>
    </template>
  </ElDrawer>
</template>

<script lang="ts" setup>
  import { useAccount } from '@wagmi/vue'
  import { LIST_NETWORK } from '~/config/networks'
  import type { IPool } from '~/types/pool.type'

  interface IProps {
    poolDetail: IPool | undefined
  }
  const _props = withDefaults(defineProps<IProps>(), {
    poolDetail: undefined
  })

  const drawer = defineModel('drawer', {
    type: Boolean,
    default: false
  })

  const { setOpenPopup } = useBaseStore()
  const { isConnected } = useAccount()

  const getNetwork = (networkName: string) => {
    return LIST_NETWORK.find((item) => item.network === networkName)
  }

  const formatDollar = (tvl: number | string) => {
    const value = parseFloat(tvl.toString()) >= 1 ? parseFloat(tvl.toString()).toFixed(2) : tvl
    return formatNumberAbbreviation(+value)
  }
</script>

<style lang="scss" scoped></style>
