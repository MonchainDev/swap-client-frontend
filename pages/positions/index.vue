<template>
  <div class="mx-auto max-w-[1200px] pb-10 pt-6 sm:px-3">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-medium leading-6">Top pools by TVL</h1>
      <ElInput v-model="search" placeholder="Search pool" clearable class="input-search h-10 !w-[200px]" />
    </div>
    <BaseTable :data="DATA_POOL" class="mt-9">
      <ElTableColumn label="#" type="index" align="center" width="70" class-name="index" />
      <ElTableColumn label="Pool" width="320">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <div class="relative size-7">
              <div class="absolute left-0 top-0 w-[13px] overflow-hidden">
                <div class="flex size-7">
                  <img :src="row.token0.icon" alt="logo token" class="z-[1] object-contain" />
                </div>
              </div>
              <div class="absolute right-0 top-0 flex w-[13px] flex-row-reverse overflow-hidden">
                <div class="relative flex h-7 w-7 flex-shrink-0">
                  <img :src="row.token1.logo" alt="logo token" class="z-[1] object-contain" />
                </div>
              </div>
            </div>
            <span>{{ row.token0.symbol }}/{{ row.token1.symbol }}</span>
            <span class="rounded bg-surface px-[6px] py-[2px] text-xs font-medium lowercase text-secondary">{{ row.protocolVersion }}</span>
            <span class="rounded bg-surface px-[6px] py-[2px] text-xs font-medium lowercase text-secondary">{{ row.feeTier / 10000 }}%</span>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="TVL" align="right" width="162">
        <template #default="{ row }">
          <span>${{ formatNumberAbbreviation(row.totalLiquidity.value) }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="APR" align="right" width="162">
        <span>{{ Math.floor(Math.random() * 60) }}%</span>
      </ElTableColumn>
      <ElTableColumn label="1D vol" align="right" width="162">
        <template #default="{ row }">
          <span>${{ formatNumberAbbreviation(row.volume1Day.value) }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="30D vol" align="right" width="162">
        <template #default="{ row }">
          <span>${{ formatNumberAbbreviation(row.volume30Day.value) }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="1D vol/TVL" align="right" width="162">
        <template #default="{ row }">
          <span>{{ (row.volume1Day.value / row.totalLiquidity.value).toFixed(2) }}</span>
        </template>
      </ElTableColumn>
    </BaseTable>
  </div>
</template>

<script lang="ts" setup>
  import DATA_POOL from '@/constant/data-pool.json'

  useHead({
    title: 'Manage pool liquidity'
  })
  const search = ref('')

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

<style lang="scss" scoped>
  :deep(.input-search) {
    .el-input__wrapper {
      border-radius: 12px;
      .el-input__inner {
        font-size: 16px;
      }
    }
  }
</style>
