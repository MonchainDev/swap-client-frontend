<template>
  <div class="choose-network-bridge">
    <ElPopover
      v-model:visible="visible"
      placement="bottom"
      width="320"
      :show-arrow="false"
      trigger="click"
      popper-class="popper-choose-network-bridge"
      :teleported="false"
    >
      <template #reference>
        <slot name="reference">
          <div :class="type === 'FROM' ? 'from-network' : 'to-network'" class="h-[103px] cursor-pointer bg-[#EFEFFF] sm:h-[90px]">
            <p class="mb-4 text-primary">{{ type === 'FROM' ? 'From network' : 'To network' }}</p>
            <div class="flex cursor-pointer items-center gap-2 rounded-lg bg-[#EFEFFF]">
              <img :src="type === 'FROM' ? fromNetwork?.logo : toNetwork?.logo" alt="logo" class="size-7 rounded-lg" />
              <span class="text-base font-semibold sm:font-normal">{{ type === 'FROM' ? fromNetwork?.title : toNetwork?.title }}</span>
              <BaseIcon name="arrow" size="24" class="-rotate-90" />
            </div>
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
          <li v-for="item in listNetwork" :key="item.value">
            <div
              class="flex cursor-pointer items-center justify-between gap-3"
              :class="{ 'pointer-events-none opacity-50': item.disabled }"
              @click="handleSelectNetwork(item)"
            >
              <div class="flex items-center gap-3">
                <img :src="item.logo" alt="logo" class="size-9 rounded-lg" />
                <span class="text-sm font-semibold text-primary sm:font-normal">{{ item.title }}</span>
              </div>
              <!-- <div v-if="isSelect">
                <BaseIcon :name="useIncludes(networkSelected, item.value) ? 'checkbox-fill' : 'checkbox'" size="24" />
              </div> -->
            </div>
          </li>
        </ul>
      </div>
    </ElPopover>
  </div>
</template>

<script lang="ts" setup>
  import { LIST_NETWORK } from '~/constant'
  import type { INetwork } from '~/types'

  interface IProps {
    // isSelect?: boolean
    type: 'FROM' | 'TO'
  }

  const _props = withDefaults(defineProps<IProps>(), {
    // isSelect: false,
    type: 'FROM'
  })

  const { fromNetwork, toNetwork } = storeToRefs(useBridgeStore())
  const visible = ref(false)
  const search = ref('')

  // const networkSelected = defineModel('networkSelected', {
  //   type: Array<string>,
  //   default: []
  // })

  const listNetwork = computed(() => {
    return LIST_NETWORK.filter((item) => item.title.toLowerCase().includes(useTrim(search.value.toLowerCase())))
  })

  const handleSelectNetwork = (item: INetwork) => {
    if (_props.type === 'FROM') {
      fromNetwork.value = item
      visible.value = false
    } else {
      toNetwork.value = item
      visible.value = false
    }
    // if (_props.isSelect) {
    //   const index = networkSelected.value.indexOf(item.value)
    //   if (index > -1) {
    //     networkSelected.value.splice(index, 1)
    //   } else {
    //     networkSelected.value.push(item.value)
    //   }
    //   if (networkSelected.value.length === 0) {
    //     networkSelected.value.push(DEFAULT_NETWORK.value)
    //   }
    // }
  }
</script>

<style lang="scss" scoped>
  .choose-network-bridge {
    :deep(.popper-choose-network-bridge) {
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

    .from-network {
      @apply rounded-lg py-3 pl-8;
    }
    .to-network {
      @apply rounded-lg py-3 pl-12;
    }
  }
</style>
