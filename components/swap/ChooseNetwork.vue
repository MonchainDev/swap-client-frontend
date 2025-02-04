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
        <div class="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#EFEFFF] px-2">
          <img :src="network.logo" alt="logo" class="size-6 rounded-lg" />
          <span class="text-sm font-semibold sm:font-normal">{{ network.title }}</span>
          <BaseIcon name="arrow" size="16" class="-rotate-90" />
        </div>
      </template>
      <div class="flex flex-col gap-7">
        <ElInput v-model="search" placeholder="Search network by name" class="input-search">
          <template #prefix>
            <BaseIcon name="search" size="18" class="text-primary" />
          </template>
        </ElInput>
        <ul class="space-y-4">
          <li v-for="item in listNetwork" :key="item.value">
            <div
              class="flex cursor-pointer items-center gap-3"
              @click="
                () => {
                  network = item
                  visible = false
                }
              "
            >
              <img :src="item.logo" alt="logo" class="size-6 rounded-lg" />
              <span class="text-sm font-semibold text-primary sm:font-normal">{{ item.title }}</span>
            </div>
          </li>
        </ul>
      </div>
    </ElPopover>
  </div>
</template>

<script lang="ts" setup>
  import { LIST_NETWORK } from '~/constant'

  const { networkSelected: network } = storeToRefs(useSwapStore())
  const visible = ref(false)
  const search = ref('')

  const listNetwork = computed(() => {
    return LIST_NETWORK.filter((item) => item.title.toLowerCase().includes(search.value.toLowerCase()))
  })
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
