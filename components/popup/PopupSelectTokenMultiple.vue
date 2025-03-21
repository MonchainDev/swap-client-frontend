<template>
  <BasePopup name="popup-selected-token-multiple" :is-show-footer="false" :fullscreen="!isDesktop" width="540" :title="titlePopup" @close="search = ''">
    <template v-if="!isDesktop" #close>
      <BaseIcon name="arrow-down" size="24" class="rotate-90" @click="setOpenPopup('popup-select-token', false)" />
    </template>

    <div class="popup-select-token">
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
        </ElInput>
        <template v-if="tokenRecentFilter.length">
          <div class="grid grid-cols-[1fr_40px] gap-1">
            <ElScrollbar class="hidden-scroll">
              <ul class="flex gap-4">
                <li
                  v-for="item in tokenRecentFilter"
                  :key="item.tokenAddress"
                  class="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-solid border-gray-3 bg-white px-4"
                >
                  <img
                    :src="item?.icon_url || ''"
                    alt="logo token"
                    class="size-5 rounded-full object-cover"
                    @error="handleImageError($event)"
                    @click="handleClickToken(item)"
                  />
                  <span class="flex-1 text-xs font-semibold" @click="handleClickToken(item)">{{ item.tokenSymbol }}</span>
                  <BaseIcon name="x-circle" size="14" class="cursor-pointer" @click="removeToken(item)" />
                </li>
              </ul>
            </ElScrollbar>
            <div class="reload flex items-center justify-end">
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
                  <img :src="item?.icon_url || ''" alt="logo token" class="size-10 rounded-full object-cover" @error="handleImageError($event)" />
                  <div class="flex flex-col">
                    <span class="text-base font-medium">{{ item.tokenSymbol }}</span>
                    <span class="text-xs text-gray-8">{{ NETWORK_NAMES[item.chainId as ChainId] }}</span>
                  </div>
                </div>
                <div class="mr-3">
                  <BaseIcon :name="checkExits(item)" size="24" />
                </div>
              </li>
            </ul>
          </ElScrollbar>
          <h3 v-else class="pt-6 text-center text-gray-6">There are no data</h3>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script lang="ts" setup>
  import { NETWORK_NAMES } from '~/config/networks'
  import type { ChainId, IToken } from '~/types'

  interface IProps {
    listToken: IToken[]
    tokenSelected: IToken[]
  }

  const props = withDefaults(defineProps<IProps>(), {
    listToken: () => [],
    tokenSelected: () => []
  })

  const { setOpenPopup } = useBaseStore()
  const { isDesktop } = storeToRefs(useBaseStore())
  const search = ref('')
  const loading = ref(false)

  const data = computed(() => {
    return props.listToken.filter((item) => {
      return (
        item.tokenSymbol.toLowerCase().includes(search.value.toLowerCase()) || item.tokenAddress?.toLowerCase().includes(search.value.toLowerCase())
        // || item.address?.toLowerCase().includes(search.value.toLowerCase())
      )
    })
  })

  const tokenRecentFilter = computed(() => {
    return props.listToken.filter((item) => props.tokenSelected.some((selected) => selected.id === item.id))
  })

  const titlePopup = computed(() => {
    return `Select tokens ${props.tokenSelected.length ? ': ' + props.tokenSelected.length : ''}`
  })

  const handleSearchToken = useDebounce(() => {
    loading.value = false
  }, 600)

  const emit = defineEmits<{
    change: [item: IToken, type: 'add' | 'remove']
    removeAll: []
  }>()

  const handleClickToken = (item: IToken) => {
    // const index = props.tokenSelected.indexOf(item.tokenAddress)
    // if (index > -1) {
    //   props.tokenSelected.splice(index, 1)
    // } else {
    //   props.tokenSelected.push(item.tokenAddress)
    // }
    emit('change', item, 'add')
  }

  const removeToken = (item: IToken) => {
    // const index = props.tokenSelected.indexOf(item.tokenAddress)
    // if (index > -1) {
    //   props.tokenSelected.splice(index, 1)
    // }
    emit('change', item, 'remove')
  }

  const removeAll = () => {
    // props.tokenSelected = []
    emit('removeAll')
  }

  const checkExits = (item: IToken) => {
    return props.tokenSelected.some((selected) => selected.id === item.id) ? 'checkbox-fill' : 'checkbox'
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
