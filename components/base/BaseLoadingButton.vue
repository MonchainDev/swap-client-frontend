<template>
  <div class="loader"></div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
  .loader {
    width: 18px;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 3px solid var(--color-surface3);
    border-right-color: var(--color-secondary);
    animation: l2 1s infinite linear;
  }
  @keyframes l2 {
    0% {
      transform: rotate(0turn);
    }
    30% {
      transform: rotate(0.7turn);
    }
    100% {
      transform: rotate(1turn);
    }
  }
</style>
