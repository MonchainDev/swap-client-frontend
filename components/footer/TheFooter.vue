<template>
  <BannerAds class="mt-[67px]" />

  <footer
    class="mx-auto mt-[21px] grid w-[1009px] grid-cols-[1fr_1fr_1fr_240px] gap-[72px] border-t border-solid border-gray-4 pb-7 pt-8 sm:w-full sm:grid-cols-3 sm:gap-3 sm:border-none sm:px-4"
  >
    <div class="flex flex-col gap-4">
      <span class="font-semibold">Website</span>
      <ul class="flex flex-col gap-2 text-sm opacity-60">
        <li>Home</li>
        <li>How to use</li>
        <li>About</li>
        <li>Smart Contract</li>
      </ul>
    </div>
    <div class="flex flex-col gap-4">
      <span class="font-semibold">About</span>
      <ul class="flex flex-col gap-2 text-sm opacity-60">
        <li>Contact</li>
        <li>Location</li>
        <li>Visit</li>
      </ul>
    </div>
    <div class="flex flex-col gap-4">
      <span class="font-semibold">Follow</span>
      <ul class="flex flex-col gap-2 text-sm opacity-60">
        <li>Instagram</li>
        <li>Facebook</li>
      </ul>
    </div>
    <div class="flex flex-col gap-7 sm:hidden">
      <span class="font-semibold">Sign up for ous newsletter</span>
      <ElInput v-model="email" placeholder="Email address" class="input-email">
        <template #suffix>
          <BaseIcon name="arrow-down" size="18" class="-rotate-90 text-primary" />
        </template>
      </ElInput>
    </div>
  </footer>
</template>

<script lang="ts" setup>
  import BannerAds from '../ads/BannerAds.vue'

  const email = ref('')
</script>

<style scoped lang="scss">
  :deep(.input-email) {
    .el-input__wrapper {
      width: 100%;
      box-shadow: unset;
      height: 48px;
      background-color: var(--color-gray-3);
      border-radius: 18px;
      .el-input__inner {
        font-size: 16px;
        color: var(--color-primary);
      }
    }
  }
</style>
