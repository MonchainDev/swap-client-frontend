<template>
  <LazyBasePopup
    name="popup-select-token"
    :is-show-footer="false"
    :fullscreen="!isDesktop"
    width="540"
    :title="titlePopup"
    class="popup-select-token"
    @close="search = ''"
  >
    <template v-if="!isDesktop" #close>
      <BaseIcon name="arrow-down" size="24" class="rotate-90" @click="setOpenPopup('popup-select-token', false)" />
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
        <template v-if="showNetwork" #suffix>
          <div class="flex min-w-[136px] items-center gap-[9px] rounded-lg bg-white p-[6px] sm:hidden">
            <img :src="network.logo" alt="logo" class="size-6 rounded-lg" />
            <span class="text-xs font-semibold text-primary">{{ network.title }}</span>
          </div>
        </template>
      </ElInput>
      <template v-if="recentTokens.length">
        <div class="grid gap-1" :class="{ 'grid-cols-[1fr_40px]': _props.isSelect }">
          <ElScrollbar class="hidden-scroll">
            <ul class="flex gap-4">
              <li
                v-for="item in recentTokens"
                :key="item.address"
                class="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-solid border-gray-3 bg-white px-4"
              >
                <img
                  :src="item.icon_url || ''"
                  alt="logo token"
                  class="size-5 rounded-full object-cover"
                  @error="handleImageError($event)"
                  @click="handleClickToken(item)"
                />
                <span class="flex-1 text-xs font-semibold" @click="handleClickToken(item)">{{ item.symbol }}</span>
                <BaseIcon v-if="_props.isSelect" name="x-circle" size="14" class="cursor-pointer" @click="removeToken(item)" />
              </li>
            </ul>
          </ElScrollbar>
          <div v-if="_props.isSelect" class="reload flex items-center justify-end">
            <BaseIcon name="reload" size="24" class="cursor-pointer" @click="removeAll" />
          </div>
        </div>
      </template>
    </div>
    <div class="bg-[#FAFAFA]">
      <SkeletonListToken v-if="loading" class="px-8 pt-6 sm:px-4" />
      <div v-else class="flex h-[500px] flex-col gap-2 pb-4">
        <ElScrollbar v-if="data.length" max-height="500px">
          <ul class="pr-4">
            <li
              v-for="item in data"
              :key="item.address"
              class="flex h-[68px] cursor-pointer items-center justify-between gap-3 pl-8 first:mt-6 hover:bg-gray-3 sm:pl-4"
              @click="handleClickToken(item)"
            >
              <div class="grid h-[68px] cursor-pointer grid-cols-[40px_1fr] items-center gap-3">
                <img :src="item.icon_url || ''" alt="logo token" class="size-10 rounded-full object-cover" @error="handleImageError($event)" />
                <div class="flex flex-col">
                  <span class="text-base font-medium">{{ item.name }}</span>
                  <span class="text-xs text-gray-8">{{ item.symbol }}</span>
                </div>
              </div>
              <div v-if="isSelect" class="mr-3">
                <BaseIcon :name="useIncludes(tokenSelected, item.address) ? 'checkbox-fill' : 'checkbox'" size="24" />
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
  import type { IToken } from '~/types'
  import { useStorage } from '@vueuse/core'

  interface IProps {
    showNetwork?: boolean
    isSelect?: boolean
  }

  const _props = withDefaults(defineProps<IProps>(), {
    showNetwork: true,
    isSelect: false
  })

  const emit = defineEmits<{
    select: [token: IToken]
  }>()

  const tokenSelected = defineModel('tokenSelected', {
    type: Array<string>,
    default: []
  })

  const { setOpenPopup } = useBaseStore()
  const { listToken, isDesktop, currentNetwork: network } = storeToRefs(useBaseStore())
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

  const titlePopup = computed(() => {
    return _props.isSelect ? `Select tokens ${tokenSelected.value.length ? ': ' + tokenSelected.value.length : ''}` : 'Select a token'
  })

  const handleSearchToken = useDebounce(() => {
    loading.value = false
  }, 600)

  const handleClickToken = (item: IToken) => {
    recentTokens.value = [item, ...recentTokens.value.filter((token) => token.address !== item.address)].slice(0, 7)

    if (_props.isSelect) {
      const index = tokenSelected.value.indexOf(item.address)
      if (index > -1) {
        tokenSelected.value.splice(index, 1)
      } else {
        tokenSelected.value.push(item.address)
      }
    } else {
      emit('select', { ...item, icon_url: item.icon_url ?? '' })
      setOpenPopup('popup-select-token', false)
    }
  }

  const removeToken = (item: IToken) => {
    recentTokens.value = recentTokens.value.filter((token) => token.address !== item.address)
    if (_props.isSelect) {
      const index = tokenSelected.value.indexOf(item.address)
      if (index > -1) {
        tokenSelected.value.splice(index, 1)
      }
    }
  }

  const removeAll = () => {
    recentTokens.value = []
    if (_props.isSelect) {
      tokenSelected.value = []
    }
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
