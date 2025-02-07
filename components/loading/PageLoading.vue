<template>
  <div class="flex min-h-screen w-full flex-col items-center justify-center gap-2">
    <div class="loader"></div>
    <div class="text-sm">Loading...</div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
  .loader {
    width: 120px;
    height: 22px;
    border-radius: 20px;
    color: #514b82;
    border: 2px solid;
    position: relative;
  }
  .loader::before {
    content: '';
    position: absolute;
    margin: 2px;
    inset: 0 100% 0 0;
    border-radius: inherit;
    background: currentColor;
    animation: l6 2s infinite;
  }
  @keyframes l6 {
    100% {
      inset: 0;
    }
  }
</style>
