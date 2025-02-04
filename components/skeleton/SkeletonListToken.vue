<template>
  <div class="max-h-[545px] overflow-hidden">
    <ElSkeleton animated>
      <template #template>
        <el-skeleton-item variant="text" style="width: 100px; height: 24px; border-radius: 999px" />
        <div class="mt-2">
          <div v-for="item in 10" :key="item" class="grid h-[68px] grid-cols-[40px_1fr] items-center gap-3">
            <el-skeleton-item variant="circle" style="width: 40px; height: 40px; border-radius: 999px" />
            <div class="flex flex-col gap-1">
              <el-skeleton-item variant="text" style="width: 120px; height: 24px; border-radius: 999px" />
              <el-skeleton-item variant="text" style="width: 60px; height: 20px; border-radius: 999px" />
            </div>
          </div>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss"></style>
