<template>
  <div class="base-table">
    <ElTable v-loading="loading" :data="data">
      <slot></slot>
    </ElTable>
  </div>
</template>

<script lang="ts" setup generic="T">
  interface IProps {
    data: T[] | undefined
    loading?: boolean
  }

  const _props = withDefaults(defineProps<IProps>(), {
    data: () => [],
    loading: false
  })
</script>

<style lang="scss" scoped>
  .base-table {
    :deep(.el-table) {
      --el-table-header-bg-color: #fafafa;
      .el-table__inner-wrapper {
        &::before {
          display: none;
        }
        .el-table__header-wrapper {
          thead {
            tr th {
              height: 48px;
              // border-top: 1px solid #2222220d;
              .cell {
                font-size: 16px;
                line-height: 24px;
                color: var(--color-secondary);
              }
            }
          }
        }
        .el-table__body {
          tr td {
            height: 64px;
            .cell {
              font-size: 14px;
              color: var(--color-primary);
            }
          }
          .index {
            .cell {
              color: var(--color-secondary);
            }
          }
        }
      }
    }
  }
</style>
