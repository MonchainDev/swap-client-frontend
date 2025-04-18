<template>
  <LazyBasePopup
    name="popup-sell-token"
    :is-show-footer="false"
    width="540"
    title="Select a token"
    class="popup-sell-token"
    @close="search = ''"
    @open="handleOpen"
  >
    <template v-if="!isDesktop" #close>
      <BaseIcon name="arrow-down" size="24" class="rotate-90" @click="setOpenPopup('popup-sell-token', false)" />
    </template>
    <div class="relative mt-1 flex flex-col gap-3 px-8 pb-6 shadow sm:px-4">
      <ElInput
        v-model="search"
        autofocus
        placeholder="Search by token or address..."
        class="input-search w-full"
        @input="
          () => {
            loading = true
            handleSearchToken()
          }
        "
      >
        <template #prefix>
          <BaseIcon name="search" class="text-primary" size="20" />
        </template>
        <template #suffix>
          <div class="flex min-w-[136px] items-center justify-center gap-[9px] rounded-lg bg-white p-[6px] sm:hidden">
            <img :src="fromNetwork?.logo" alt="logo" class="size-6 rounded-lg" />
            <span class="text-xs font-semibold text-primary">{{ fromNetwork?.network }}</span>
          </div>
        </template>
      </ElInput>
    </div>
    <div class="bg-[#FAFAFA]">
      <SkeletonListToken v-if="loading" class="px-8 pt-6 sm:px-4" />
      <div v-else class="flex h-[500px] flex-col gap-2 pb-4">
        <ElScrollbar v-if="data.length" max-height="500px">
          <ul class="pr-8">
            <li
              v-for="item in data"
              :key="item.tokenAddress"
              class="mb-3 flex h-[52px] cursor-pointer items-center justify-between gap-3 px-8 first:mt-3 last:mb-0 hover:bg-gray-3 sm:px-4"
              @click="handleClickToken(item)"
            >
              <div class="grid h-[68px] cursor-pointer grid-cols-[40px_1fr] items-center gap-3">
                <img :src="item.icon_url || ''" alt="logo token" class="size-10 rounded-full object-cover" @error="handleImageError($event)" />
                <div class="flex flex-col">
                  <span class="text-base font-medium">{{ item.tokenSymbol }}</span>
                  <!-- <span class="text-xs text-gray-8">{{ item.network }}</span> -->
                </div>
              </div>
              <div v-if="isConnected" class="text-sm">
                <span v-if="!isIncompatible" class="text-primary">0.012890</span>
                <span v-else class="text-[#F99F01]">Incompatible</span>
              </div>
            </li>
          </ul>
        </ElScrollbar>
        <h3 v-else class="pt-6 text-center text-gray-6">There are no data</h3>
      </div>
    </div>
  </LazyBasePopup>
</template>

<script lang="ts" setup>
  import { useAccount } from '@wagmi/vue'
  import type { IToken } from '~/types'

  const emit = defineEmits<{
    select: [token: IToken]
  }>()

  const data = ref<IToken[]>([])
  const { isConnected } = useAccount()
  const { isDesktop } = storeToRefs(useBaseStore())
  const { fromNetwork } = storeToRefs(useBridgeStore())

  const { setOpenPopup } = useBaseStore()
  // const { currentNetwork: network } = storeToRefs(useBaseStore())
  const search = ref('')
  const loading = ref(false)
  const isIncompatible = ref<boolean>(false)

  const init = async (first = false) => {
    const query = first ? { network: fromNetwork.value.network } : { network: fromNetwork.value.network, token: useTrim(search.value) }
    const rs =
      first || useTrim(search.value) === ''
        ? await $fetch<IToken[]>('/api/network/token', { params: { ...query, crossChain: 'Y' } })
        : await $fetch<IToken[]>('/api/network/token-info', { params: { ...query, crossChain: 'Y' } })
    data.value = rs.map((item) => ({
      ...item,
      icon_url: item.icon_url ?? '',
      address: item.tokenAddress,
      name: item.tokenSymbol,
      symbol: item.tokenSymbol,
      decimals: item.tokenDecimals
    }))
    loading.value = false
  }
  const handleSearchToken = useDebounce(() => {
    init()
  }, 400)

  const handleClickToken = (item: IToken) => {
    emit('select', { ...item, icon_url: item.icon_url ?? '' })
    setOpenPopup('popup-sell-token', false)
  }
  const handleOpen = () => {
    init(true)
  }
  const { handleImageError } = useErrorImage()
</script>

<style lang="scss" scoped>
  .shadow {
    box-shadow: 0px 2px 4px 0px rgb(0 0 0 / 10%);
  }
</style>

<style lang="scss">
  .popup-sell-token {
    @apply sm:!max-w-full;
    .hidden-scroll {
      .el-scrollbar__bar {
        display: none !important;
      }
    }
    .input-search {
      --el-input-inner-height: 42px;
      --el-input-border-radius: 8px;

      .el-input__wrapper {
        background-color: #f5f5f5;
        box-shadow: unset;
        padding: 0 4px 0 21px;
        .el-input__inner {
          font-size: 16px;
          color: var(--color-primary);
        }
      }
    }
    .wrap-header {
      @apply sm:w-fit sm:flex-row-reverse sm:gap-2;
    }
  }
  .reload {
    position: relative;
    &::after {
      content: '';
      position: absolute;
      width: 15px;
      height: 100%;
      top: 0;
      left: -4px;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) 2%, rgba(153, 153, 153, 0.6) 100%);
    }
  }
</style>
