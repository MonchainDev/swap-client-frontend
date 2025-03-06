<template>
  <div v-if="props.total > 0" class="base-pagination py-3 sm:py-0">
    <div class="flex items-center justify-end">
      <!-- <div v-if="isDesktop" class="text-sm text-[#667085]">
        Show
        {{ formatNumber(props.query.total == 0 ? 0 : (props.query.page - 1) * props.query.pageSize + 1) }}
        -
        {{ formatNumber(props.query.page * props.query.pageSize > props.query.total ? props.query.total : props.query.page * props.query.pageSize) }}
        /
        {{ formatNumber(props.query.total) }} {{ props.label }}
      </div> -->
      <div class="list-paging flex gap-2">
        <div
          class="flex h-10 cursor-pointer select-none items-center justify-center gap-[2px] rounded border border-solid border-gray-3 pl-2 pr-3 hover:border-hyperlink"
          :class="{ 'pointer-events-none': page === 1 }"
          @click="page -= 1"
        >
          <BaseIcon name="arrow" size="16" />
          <span class="text-sm">Back</span>
        </div>
        <ElPagination
          v-model:current-page="page"
          :total="props.total"
          :page-size="20"
          :pager-count="5"
          popper-class="select-pagination sm:flex sm:justify-end"
          background
          layout=" pager"
        />
        <div
          class="flex h-10 cursor-pointer select-none items-center justify-center gap-[2px] rounded border border-solid border-gray-3 bg-hyperlink pl-3 pr-2 text-white hover:border-hyperlink"
          :class="{ 'pointer-events-none': page === Math.ceil(props.total / 20) }"
          @click="page += 1"
        >
          <span class="text-sm">Next</span>
          <BaseIcon name="arrow" size="16" class="rotate-180" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface IProps {
    total: number
  }
  const props = withDefaults(defineProps<IProps>(), {
    total: 0
  })

  const page = defineModel('page', {
    type: Number,
    default: 1
  })
</script>

<style scoped lang="scss">
  .base-pagination {
    :deep(.list-paging) {
      .el-pager {
        .number {
          padding: 8px 12px;
          height: 40px;
          border: 1px solid var(--color-gray-3);
          border-radius: 4px;
          background-color: transparent;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-primary);
          &:hover {
            border-color: var(--color-hyperlink);
            color: var(--color-hyperlink);
          }
        }
        .is-active {
          border-color: var(--color-hyperlink);
          color: var(--color-primary);
          &:hover {
            color: var(--color-hyperlink);
          }
        }
      }
    }
  }
</style>
