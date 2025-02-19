<template>
  <div class="mt-[26px] rounded-lg bg-white py-8">
    <div class="flex items-center justify-between px-6">
      <h4 class="text-2xl font-semibold leading-7">All Pools</h4>
      <div class="flex gap-4">
        <ChooseNetwork v-model:network-selected="networkSelected" is-select>
          <template #reference>
            <div class="flex h-[42px] w-[280px] cursor-pointer items-center justify-between gap-1 rounded-lg border border-solid border-gray-4 pl-4 pr-1">
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
                      <img
                        :src="item.logo"
                        alt="logo"
                        class="border-sky-500 size-6 rounded border-[2px] border-solid border-white [&:not(:first-child)]:-ml-3"
                      />
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
          class="flex h-[42px] w-[280px] cursor-pointer items-center justify-between gap-1 rounded-lg border border-solid border-gray-4 pl-4 pr-1"
          @click="setOpenPopup('popup-select-token')"
        >
          <div class="flex items-center gap-2">
            <div class="flex">
              <template v-if="tokenListSelected.length > 3">
                <div class="flex">
                  <img
                    v-for="(_i, index) in 3"
                    :key="index"
                    :src="tokenListSelected[index].icon_url"
                    alt="logo"
                    class="border-sky-500 size-7 rounded border-[2px] border-solid border-white [&:not(:first-child)]:-ml-3"
                  />
                  <div
                    class="-ml-3 flex size-6 items-center justify-center rounded border-[2px] border-solid border-white bg-[#CCE0FF] text-xs font-bold text-hyperlink"
                  >
                    +{{ tokenListSelected.length - 3 }}
                  </div>
                </div>
              </template>
              <template v-else>
                <template v-for="item in tokenListSelected" :key="item">
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
    <BaseTable :data="DATA_POOL" class="mt-9">
      <ElTableColumn label="Pools" width="320">
        <div class="flex gap-[10px]">
          <div class="flex">
            <img src="https://cryptologos.cc/logos/compound-comp-logo.png?v=040" alt="logo" class="size-9" />
            <img src="/token-default.png" alt="logo" class="-ml-[18px] size-9" />
          </div>
          <div class="flex flex-1 flex-col">
            <span class="text-base font-semibold">ATOM / USDC</span>
            <div class="flex items-center gap-1">
              <img src="/logo-mon-chain.png" alt="logo" class="h-[14px] w-[14px]" />
              <span class="text-xs text-gray-8">Mon Chain</span>
            </div>
          </div>
        </div>
      </ElTableColumn>
      <ElTableColumn label="Fee tier" align="center" width="100">
        <div class="mx-auto flex h-8 w-[55px] items-center justify-center rounded-md bg-[#F5F5F5] text-sm font-semibold">0.01%</div>
      </ElTableColumn>
      <ElTableColumn label="APR">
        <div class="text-sm text-[#049C6B]">Up to 54.34% <span class="text-gray-6"> 44.88%</span></div>
      </ElTableColumn>
      <ElTableColumn label="TVL" align="right">
        <span class="text-sm">$ 5,631,395.2</span>
      </ElTableColumn>
      <ElTableColumn label="Volume 24h" align="right">
        <template #default="{ row }">
          <span class="text-sm">${{ formatNumberAbbreviation(row.volume1Day.value) }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="" align="right" width="50" />
    </BaseTable>
  </div>
  <PopupSelectToken v-model:token-selected="tokenSelected" :show-network="false" is-select />
</template>

<script lang="ts" setup>
  import DATA_POOL from '@/constant/data-pool.json'

  import { LIST_NETWORK } from '~/constant'
  const { setOpenPopup } = useBaseStore()
  const { listToken } = storeToRefs(useBaseStore())

  const { handleImageError } = useErrorImage()

  const networkSelected = ref<string[]>(LIST_NETWORK.map((item) => item.value))
  const tokenSelected = ref<string[]>([])

  const networkListSelected = computed(() => {
    return LIST_NETWORK.filter((item) => networkSelected.value.includes(item.value))
  })
  const tokenListSelected = computed(() => {
    return listToken.value.filter((item) => tokenSelected.value.includes(item.address))
  })

  const titleFilterNetwork = computed(() => {
    return networkListSelected.value.length === LIST_NETWORK.length
      ? `All networks (${networkListSelected.value.length})`
      : networkListSelected.value.map((item) => item.title).join(', ')
  })

  const titleFilterToken = computed(() => {
    return tokenListSelected.value.length === 0 ? 'All tokens' : tokenListSelected.value.map((item) => item.symbol).join(', ')
  })

  const formatNumberAbbreviation = (value: number) => {
    if (!value) return '0'

    const number = Number(value)
    const SI_SYMBOL = ['', 'K', 'M', 'B', 'T', 'P', 'E']

    // Tìm chỉ số của 1000 gần nhất
    const tier = (Math.log10(Math.abs(number)) / 3) | 0

    // Nếu không có chỉ số nào, trả về chuỗi ban đầu
    if (tier === 0) return value

    // Tính giá trị đại diện của số
    const suffix = SI_SYMBOL[tier]

    // Chuyển đổi số về dạng số nguyên để loại bỏ số thập phân
    const scale = Math.pow(10, tier * 3)
    const scaledNumber = number / scale

    // Định dạng số với một chữ số thập phân
    const formattedNumber = scaledNumber.toFixed(2)

    // Trả về chuỗi đã chuyển đổi
    return formattedNumber + suffix
  }
</script>

<style lang="scss"></style>
