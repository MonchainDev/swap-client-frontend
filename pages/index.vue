<template>
  <Swap />
</template>

<script lang="ts" setup>
  import Swap from './swap.vue'

  definePageMeta({
    middleware: ['reset-form-liquidity-middleware']
  })
</script>

<style lang="scss" scoped>
  :deep(.popper-setting-swap) {
    --el-popover-border-radius: 16px;
    --el-popover-padding: 16px;

    .input-amount {
      .el-input__wrapper {
        width: 70px;
        box-shadow: unset;
        height: 21px;
        background-color: transparent;
        .el-input__inner {
          font-size: 16px;
          color: var(--color-primary);
          text-align: right;
        }
      }
    }
  }
</style>
