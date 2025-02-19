<template>
  <div class="base-table">
    <ElTable :data="data">
      <slot></slot>
    </ElTable>
  </div>
</template>

<script lang="ts" setup generic="T">
  interface IProps {
    data: T[]
  }

  const _props = withDefaults(defineProps<IProps>(), {
    data: () => []
  })
</script>

<style lang="scss" scoped>
  .base-table {
    :deep(.el-table) {
      --el-table-header-bg-color: #f9f9f9;
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
            &:first-child {
              border-left: 1px solid #2222220d;
            }
            &:last-child {
              border-right: 1px solid #2222220d;
            }
            height: 64px;
            .cell {
              font-size: 16px;
              color: var(--color-primary);
            }
          }
          .index {
            .cell {
              color: var(--color-secondary);
            }
          }
          tr:last-child {
            td:last-child {
              border-bottom-right-radius: 20px;
            }
            td:first-child {
              border-bottom-left-radius: 20px;
            }
          }
        }
      }
    }
  }
</style>
