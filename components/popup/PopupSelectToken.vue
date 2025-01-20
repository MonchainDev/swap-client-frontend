<template>
  <LazyBasePopup name="popup-select-token" width="400" title="Select a token" class="popup-select-token" @close="search = ''">
    <div class="flex flex-col gap-4">
      <ElInput
        v-model="search"
        autofocus
        placeholder="Search tokens"
        class="input-search w-full px-4"
        @input="
          () => {
            loading = true
            handleSearchToken()
          }
        "
      >
        <template #prefix>
          <BaseIcon name="search" class="text-secondary" size="20" />
        </template>
      </ElInput>
      <SkeletonListToken v-if="loading" />
      <div v-else class="flex h-[545px] flex-col gap-2 pb-4">
        <div class="flex items-center space-x-2 px-4">
          <BaseIcon name="star" size="16" class="text-secondary" />
          <span class="font-medium text-secondary">Tokens</span>
        </div>
        <ElScrollbar v-if="data.length" max-height="500px">
          <ul class="pr-4">
            <li
              v-for="item in data"
              :key="item.address"
              class="grid h-[68px] cursor-pointer grid-cols-[40px_1fr] items-center gap-3 pl-4 hover:bg-surface3"
              @click="handleClickToken(item)"
            >
              <img :src="item.icon_url" alt="logo token" class="size-10 rounded-full object-cover" @error="handleImageError($event)" />
              <div class="flex flex-col">
                <span class="font-medium">{{ item.name }}</span>
                <span class="text-sm text-secondary">{{ item.symbol }}</span>
              </div>
            </li>
          </ul>
        </ElScrollbar>
        <h3 v-else class="text-center text-secondary">There are no data</h3>
      </div>
    </div>
  </LazyBasePopup>
</template>

<script lang="ts" setup>
  import type { IToken } from '~/types'

  const emit = defineEmits<{
    select: [token: IToken]
  }>()

  const { setOpenPopup } = useBaseStore()
  const { listToken } = storeToRefs(useBaseStore())
  const search = ref('')
  const loading = ref(false)

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
    emit('select', { ...item, icon_url: item.icon_url ?? '' })
    setOpenPopup('popup-select-token', false)
  }

  const { handleImageError } = useErrorImage()
</script>

<style lang="scss">
  .popup-select-token {
    .input-search {
      --el-input-inner-height: 46px;
      --el-input-border-radius: 9999px;
      .el-input__wrapper {
        background-color: #f9f9f9;
        box-shadow: unset;
        padding: 0 16px;
        .el-input__inner {
          font-size: 16px;
        }
      }
    }
  }
</style>
