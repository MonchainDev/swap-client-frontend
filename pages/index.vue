<template>
  <div class="mx-auto mt-10 h-screen max-w-[462px] sm:px-3">...</div>
</template>

<script lang="ts" setup>
  useHead({
    title: 'Buy, sell & trade Ethereum and other top tokens'
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
