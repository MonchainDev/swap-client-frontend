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
          <div :class="type === 'FROM' ? 'from-network' : 'to-network'" class="h-[103px] cursor-pointer sm:h-[75px]">
            <p class="mb-4 text-primary sm:mb-2 sm:text-xs">{{ type === 'FROM' ? 'From network' : 'To network' }}</p>
            <div class="flex cursor-pointer items-center gap-2 rounded-lg">
              <img :src="type === 'FROM' ? fromNetwork?.logo : toNetwork?.logo" alt="logo" class="size-7 rounded-lg sm:size-5" />
              <span class="overflow-hidden text-ellipsis text-base font-semibold sm:text-xs">
                {{ type === 'FROM' ? fromNetwork?.network : toNetwork?.network }}
              </span>
              <BaseIcon name="arrow" :size="isDesktop ? '24' : '20'" class="-rotate-90" />
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
          <li v-for="item in listNetworks" :key="item.id">
            <div class="flex cursor-pointer items-center justify-between gap-3" @click="handleSelectNetwork(item)">
              <div class="flex items-center gap-3">
                <img :src="item.logo" alt="logo" class="size-9 rounded-lg" />
                <span class="text-sm font-semibold text-primary sm:font-normal">{{ item.network }}</span>
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
  import type { INetwork } from '~/types'
  import { LIST_NETWORK } from '~/config/networks'

  interface IProps {
    isSelect?: boolean
    type: 'FROM' | 'TO'
  }

  const _props = withDefaults(defineProps<IProps>(), {
    isSelect: false,
    type: 'FROM'
  })

  const { isDesktop } = storeToRefs(useBaseStore())
  const { fromNetwork, toNetwork } = storeToRefs(useBridgeStore())
  const visible = ref(false)
  const search = ref('')
  const networkSelected = defineModel('networkSelected', {
    type: Array<string>,
    default: []
  })

  const emits = defineEmits<{
    'select-network': []
  }>()

  const listNetWorkDefault = ref<INetwork[]>(LIST_NETWORK)

  const listNetworks = computed(() => {
    return listNetWorkDefault.value.filter((item) => item.network.toLowerCase().includes(useTrim(search.value.toLowerCase())))
  })

  const handleSelectNetwork = (item: INetwork) => {
    if (_props.type === 'FROM') {
      fromNetwork.value = item
      visible.value = false
    } else {
      toNetwork.value = item
      emits('select-network')
      visible.value = false
    }
  }
  watch(
    () => visible.value,
    (value) => {
      if (value) {
        if (_props.type === 'TO') {
          listNetWorkDefault.value = LIST_NETWORK.filter((chain) => chain.network !== fromNetwork.value?.network)
        }
        if (_props.type === 'FROM') {
          listNetWorkDefault.value = LIST_NETWORK.filter((chain) => chain.network !== toNetwork.value?.network)
        }
      }
    }
  )
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
      @apply rounded-lg bg-[#EFEFFF] py-3 pl-8 sm:py-2 sm:pl-4;
    }
    .to-network {
      @apply rounded-lg bg-[#F3F8FF] py-3 pl-12 sm:py-2 sm:pl-5;
    }
  }
</style>
