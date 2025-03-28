<template>
  <div class="bg-white">
    <div class="relative z-10 mx-4 flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow">
      <div class="flex flex-col gap-1">
        <h4 class="text-base font-semibold">Liquidity Pools & Farms</h4>
        <p class="text-xs text-gray-8">
          Maximize earnings with secure and smart farming <span class="text-gray-4"> | </span>
          <span class="text-hyperlink">Learn how</span>
          <span class="text-gray-4"> | </span>
          <span class="text-hyperlink">FAQ</span>
        </p>
      </div>
      <NuxtLink to="/add">
        <BaseButton size="sm" class="flex w-[108px] items-center gap-1 !text-white">
          <BaseIcon name="plus" size="16" />
          <span>Liquidity</span>
        </BaseButton>
      </NuxtLink>
    </div>
    <div class="mt-[18px] px-4 pb-4">
      <div class="grid grid-cols-2 rounded-lg bg-[#E3EEFF] p-[6px] text-sm font-semibold text-primary">
        <NuxtLink to="/liquidity/pool" class="py-[6px] text-center" :class="{ 'tab-liquid-active': tabActive === 'ALL' }" @click="tabActive = 'ALL'">
          <span class="text-sm">All Pools</span>
        </NuxtLink>
        <NuxtLink
          to="/liquidity/positions"
          class="py-[6px] text-center"
          :class="{ 'tab-liquid-active': tabActive === 'POSITION' }"
          @click="tabActive = 'POSITION'"
        >
          <span class="text-sm">My Position</span>
        </NuxtLink>
      </div>
      <ChooseNetwork v-model:network-selected="networkSelected" is-select>
        <template #reference>
          <div class="my-4 flex h-[42px] cursor-pointer items-center justify-between gap-1 rounded-lg border border-solid border-gray-4 pl-4 pr-1">
            <div class="flex items-center gap-2">
              <div class="flex">
                <template v-if="networkListSelected.length > 3">
                  <div class="flex">
                    <img
                      v-for="(_i, index) in 3"
                      :key="index"
                      :src="networkListSelected[index].logo"
                      alt="logo"
                      class="border-sky-500 size-6 rounded border-[2px] border-solid border-white [&:not(:first-child)]:-ml-3"
                    />
                    <div
                      class="-ml-3 flex size-6 items-center justify-center rounded border-[2px] border-solid border-white bg-[#CCE0FF] text-xs font-bold text-hyperlink"
                    >
                      +{{ networkListSelected.length - 3 }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <template v-for="item in networkListSelected" :key="item">
                    <img :src="item.logo" alt="logo" class="border-sky-500 size-6 rounded border-[2px] border-solid border-white [&:not(:first-child)]:-ml-3" />
                  </template>
                </template>
              </div>
              <div class="line-clamp-1 flex-1 text-sm">{{ titleFilterNetwork }}</div>
            </div>
            <BaseIcon name="arrow-chevron" size="24" class="text-gray-6" />
          </div>
        </template>
      </ChooseNetwork>
      <div
        class="flex h-[42px] cursor-pointer items-center justify-between gap-1 rounded-lg border border-solid border-gray-4 pl-4 pr-1"
        @click="setOpenPopup('popup-selected-token-multiple')"
      >
        <div class="flex items-center gap-2">
          <div class="flex">
            <template v-if="tokenSelected && tokenSelected.length > 3">
              <div class="flex">
                <img
                  v-for="(_i, index) in 3"
                  :key="index"
                  :src="tokenSelected[index].icon_url || ''"
                  alt="logo"
                  class="border-sky-500 size-6 rounded-full border-[2px] border-solid border-white [&:not(:first-child)]:-ml-3"
                  @error="handleImageError($event)"
                />
                <div
                  class="-ml-3 flex size-6 items-center justify-center rounded-full border-[2px] border-solid border-white bg-[#CCE0FF] text-xs font-bold text-hyperlink"
                >
                  +{{ tokenSelected.length - 3 }}
                </div>
              </div>
            </template>
            <template v-else>
              <template v-for="item in tokenSelected" :key="item">
                <img
                  :src="item.icon_url || ''"
                  alt="logo"
                  class="border-sky-500 size-7 rounded-full border-[2px] border-solid border-white [&:not(:first-child)]:-ml-3"
                  @error="handleImageError($event)"
                />
              </template>
            </template>
          </div>
          <div class="line-clamp-1 flex-1 text-sm">{{ titleFilterToken }}</div>
        </div>
        <BaseIcon name="arrow-chevron" size="24" class="text-gray-6" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { LIST_NETWORK } from '~/config/networks'
  import type { IToken } from '~/types'

  interface IProps {
    tokenSelected: IToken[]
  }

  const props = withDefaults(defineProps<IProps>(), {
    tokenSelected: () => []
  })
  const route = useRoute()
  const { setOpenPopup } = useBaseStore()
  const { handleImageError } = useErrorImage()
  const tabActive = ref<'ALL' | 'POSITION'>('ALL')
  tabActive.value = route.name === 'liquidity-positions' ? 'POSITION' : 'ALL'

  const networkSelected = defineModel('networkSelected', {
    type: Array<string>,
    default: []
  })

  const networkListSelected = computed(() => {
    return LIST_NETWORK.filter((item) => networkSelected.value.includes(item.network))
  })

  const titleFilterNetwork = computed(() => {
    return networkListSelected.value.length === LIST_NETWORK.length
      ? `All networks (${networkListSelected.value.length})`
      : networkListSelected.value.map((item) => item.name).join(', ')
  })
  const titleFilterToken = computed(() => {
    return props.tokenSelected?.length === 0 ? 'All tokens' : props.tokenSelected?.map((item) => item.tokenSymbol).join(', ')
  })
</script>

<style lang="scss" scoped>
  .tab-liquid-active {
    @apply rounded-lg bg-white;
  }
</style>
