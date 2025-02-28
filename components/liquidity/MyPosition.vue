<template>
  <div class="mt-5 rounded-lg bg-white px-6 py-8 shadow-md">
    <div class="flex items-center justify-between">
      <h4 class="text-xl font-semibold">My positions</h4>
      <BaseTab v-model:model="tabActive" :list="listTab" />
    </div>

    <div class="mt-[22px] flex flex-col">
      <div class="grid h-11 grid-cols-[3fr,1fr,1fr,3fr,3fr,2fr] bg-[#FAFAFA]">
        <template v-for="item in listHeader" :key="item.title">
          <div class="flex items-center" :class="{ 'justify-center': item.align === 'center', 'justify-end': item.align === 'right' }">
            <span class="text-sm font-semibold text-gray-6">{{ item.title }}</span>
          </div>
        </template>
      </div>
      <div v-loading="isPending" class="min-h-[100px]">
        <template v-if="!isPending">
          <PositionItem v-for="item in data" :key="item.tokenId.toString()" :position="item" />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { ITab } from '~/types/component.type'
  const enum TabValue {
    ALL = 'ALL',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    CLOSE = 'CLOSE'
  }

  const listTab: ITab[] = [
    { title: 'All', value: TabValue.ALL },
    { title: 'Active', value: TabValue.ACTIVE },
    { title: 'Inactive', value: TabValue.INACTIVE },
    { title: 'Closed', value: TabValue.CLOSE }
  ]
  const listHeader = [
    {
      title: 'Pools',
      align: 'left'
    },
    {
      title: 'Fee tier',
      align: 'center'
    },
    {
      title: 'APR',
      align: 'center'
    },
    {
      title: 'Min/Max',
      align: 'left'
    },
    {
      title: 'Amounts',
      align: 'left'
    },
    {
      title: 'Status',
      align: 'center'
    }
  ]

  const tabActive = ref<TabValue>(TabValue.ALL)

  const chainIds = ref([16789])
  const { data, isPending } = useAccountV3Positions(chainIds)

  watchEffect(() => {
    if (!isPending.value && data.value?.length) {
      // const { currency0, currency1 } = useExtraV3PositionInfo(data.value[0])
      // console.log('🚀 ~ watchEffect ~ currency0:', currency0)
      // console.log('🚀 ~ watchEffect ~ currency1:', currency1)
    }
  })
</script>

<style lang="scss"></style>
