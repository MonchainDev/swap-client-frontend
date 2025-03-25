<template>
  <div class="choose-network">
    <ElPopover
      v-model:visible="visible"
      placement="bottom"
      width="320"
      :show-arrow="false"
      trigger="click"
      popper-class="popper-choose-network"
      :teleported="false"
    >
      <template #reference>
        <slot name="reference">
          <div class="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#EFEFFF] px-2">
            <template v-if="isPending">
              <BaseLoadingButton />
              <span class="text-sm font-semibold sm:font-normal">Requesting</span>
            </template>
            <template v-else>
              <img :src="network.logo" alt="logo" class="size-6 rounded-lg" />
              <span class="text-sm font-semibold sm:font-normal">{{ network.name }}</span>
              <BaseIcon name="arrow" size="16" class="-rotate-90" />
            </template>
          </div>
        </slot>
      </template>

      <div class="flex flex-col gap-7">
        <ElInput v-model="search" placeholder="Search network by name" class="input-search">
          <template #prefix>
            <BaseIcon name="search" size="18" class="text-primary" />
          </template>
        </ElInput>
        <ul class="space-y-4">
          <li v-for="item in listNetwork" :key="item.chainId">
            <div class="flex cursor-pointer items-center justify-between gap-3" @click="handleSelectNetwork(item)">
              <div class="flex items-center gap-3">
                <BaseLoadingButton v-if="item.loading" />
                <img :src="item.logo" alt="logo" class="size-9 rounded-lg" />
                <span class="text-sm font-semibold text-primary sm:font-normal">{{ item.name }}</span>
              </div>
              <div v-if="isSelect">
                <BaseIcon :name="useIncludes(networkSelected, item.network) ? 'checkbox-fill' : 'checkbox'" size="24" />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </ElPopover>
  </div>
</template>

<script lang="ts" setup>
  import { useAccount, useSwitchChain } from '@wagmi/vue'
  import { DEFAULT_NETWORK, LIST_NETWORK } from '~/config/networks'
  import type { INetwork, IToken } from '~/types'
  import { useStorage } from '@vueuse/core'

  interface IProps {
    isSelect?: boolean
  }

  const _props = withDefaults(defineProps<IProps>(), {
    isSelect: false
  })

  const { resetStore: resetStoreLiquid } = useLiquidityStore()
  const { resetStore: resetStoreSwap } = useSwapStore()
  const { currentNetwork: network } = storeToRefs(useBaseStore())
  const visible = ref(false)
  const search = ref('')

  const networkSelected = defineModel('networkSelected', {
    type: Array<string>,
    default: []
  })

  const recentTokens = useStorage<IToken[]>('recent_tokens', [])

  const listNetwork = computed(() => {
    return LIST_NETWORK.filter((item) => item.name.toLowerCase().includes(useTrim(search.value.toLowerCase())))
  })

  const { chains, switchChainAsync, isPending } = useSwitchChain()
  const { isConnected } = useAccount()
  const route = useRoute('add-currency')
  const router = useRouter()
  await switchChainAsync({ chainId: network.value.chainId })

  const handleSelectNetwork = async (item: INetwork) => {
    if (_props.isSelect) {
      const index = networkSelected.value.indexOf(item.network)
      if (index > -1) {
        networkSelected.value.splice(index, 1)
      } else {
        networkSelected.value.push(item.network)
      }
      if (networkSelected.value.length === 0) {
        networkSelected.value.push(DEFAULT_NETWORK.network)
      }
    } else {
      const chainSelected = chains.value.find((chain) => chain.id === item.chainId)
      if (!chainSelected || chainSelected.id === network.value.chainId) {
        visible.value = false
        return
      }

      if (isConnected.value) {
        visible.value = false
        await switchChainAsync({ chainId: chainSelected.id })

        if (route.name === 'add-currency') {
          // replace route without query
          router.replace({ name: route.name }).then(() => {
            resetStoreLiquid()
            resetStoreSwap()
          })
        } else {
          resetStoreLiquid()
          resetStoreSwap()
        }

        recentTokens.value = []
      } else {
        network.value = { ...item }
      }
      visible.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .choose-network {
    :deep(.popper-choose-network) {
      --el-popover-border-radius: 8px;
      --el-popover-padding: 0;
      padding: 28px 24px;
      .input-search {
        .el-input__wrapper {
          width: 100%;
          box-shadow: unset;
          height: 42px;
          background-color: var(--color-gray-3);
          border-radius: 8px;
          .el-input__inner {
            font-size: 16px;
            color: var(--color-primary);
          }
        }
      }
    }
  }
</style>
