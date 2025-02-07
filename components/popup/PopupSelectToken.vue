<template>
  <LazyBasePopup
    name="popup-select-token"
    :is-show-footer="false"
    :fullscreen="!isDesktop"
    width="540"
    title="Select a token"
    class="popup-select-token"
    @close="search = ''"
  >
    <template v-if="!isDesktop" #close>
      <BaseIcon name="arrow-down" size="24" class="rotate-90" @click="setOpenPopup('popup-select-token', false)" />
    </template>
    <div class="relative mt-1 px-8 pb-6 shadow sm:px-4">
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
          <div class="flex min-w-[136px] items-center gap-[9px] rounded-lg bg-white p-[6px] sm:hidden">
            <img :src="network.logo" alt="logo" class="size-6 rounded-lg" />
            <span class="text-xs font-semibold text-primary">{{ network.title }}</span>
          </div>
        </template>
      </ElInput>
    </div>
    <div class="bg-[#FAFAFA] pt-6">
      <template v-if="recentTokens.length">
        <span class="pl-8 text-base font-semibold text-gray-8 sm:pl-4">Recents</span>
        <div class="mt-3 pb-6 pl-8 sm:pl-4">
          <ElScrollbar class="hidden-scroll">
            <ul class="flex gap-4">
              <li
                v-for="item in recentTokens"
                :key="item.address"
                class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-solid border-gray-3 bg-white px-[18px] py-2 hover:bg-gray-3"
                @click="handleClickToken(item)"
              >
                <img :src="item.icon_url || ''" alt="logo token" class="size-5 rounded-full object-cover" @error="handleImageError($event)" />
                <span class="text-xs text-gray-8">{{ item.symbol }}</span>
              </li>
            </ul>
          </ElScrollbar>
        </div>
      </template>
      <SkeletonListToken v-if="loading" class="px-8 sm:px-4" />
      <div v-else class="flex h-[545px] flex-col gap-2 pb-4">
        <span class="pl-8 text-base font-semibold text-gray-8 sm:pl-4">Tokens</span>

        <ElScrollbar v-if="data.length" max-height="500px">
          <ul class="pr-4">
            <li
              v-for="item in data"
              :key="item.address"
              class="grid h-[68px] cursor-pointer grid-cols-[40px_1fr] items-center gap-3 pl-8 hover:bg-gray-3 sm:pl-4"
              @click="handleClickToken(item)"
            >
              <img :src="item.icon_url || ''" alt="logo token" class="size-10 rounded-full object-cover" @error="handleImageError($event)" />
              <div class="flex flex-col">
                <span class="text-base font-medium">{{ item.name }}</span>
                <span class="text-xs text-gray-8">{{ item.symbol }}</span>
              </div>
            </li>
          </ul>
        </ElScrollbar>
        <h3 v-else class="text-secondary text-center">There are no data</h3>
      </div>
    </div>
  </LazyBasePopup>
</template>

<script lang="ts" setup>
  import type { IToken } from '~/types'
  import { useStorage } from '@vueuse/core'

  // interface IProps {
  //   network?: INetwork
  // }

  // const _props = withDefaults(defineProps<IProps>(), {
  //   network: () => ({ title: '', logo: '', value: '' })
  // })

  const emit = defineEmits<{
    select: [token: IToken]
  }>()

  const { setOpenPopup } = useBaseStore()
  const { listToken, isDesktop } = storeToRefs(useBaseStore())
  const { networkSelected: network } = storeToRefs(useSwapStore())
  const search = ref('')
  const loading = ref(false)

  const recentTokens = useStorage<IToken[]>('recent_tokens', [])

  const data = computed(() => {
    return listToken.value.filter((item) => {
      return (
        item.name?.toLowerCase().includes(search.value.toLowerCase()) ||
        item.symbol?.toLowerCase().includes(search.value.toLowerCase()) ||
        item.address?.toLowerCase().includes(search.value.toLowerCase())
      )
    })
  })

  const handleSearchToken = useDebounce(() => {
    loading.value = false
  }, 600)

  const handleClickToken = (item: IToken) => {
    recentTokens.value = [item, ...recentTokens.value.filter((token) => token.address !== item.address)].slice(0, 7)
    emit('select', { ...item, icon_url: item.icon_url ?? '' })
    setOpenPopup('popup-select-token', false)
  }

  const { handleImageError } = useErrorImage()
</script>

<style lang="scss" scoped>
  .shadow {
    box-shadow: 0px 2px 4px 0px rgb(0 0 0 / 10%);
  }
</style>

<style lang="scss">
  .popup-select-token {
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
        }
      }
    }
    .wrap-header {
      @apply sm:w-fit sm:flex-row-reverse sm:gap-2;
    }
  }
</style>
