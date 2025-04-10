<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
  import { SEO_METADATA, HEAD_META } from './config/metadata'

  useSeoMeta({
    title: SEO_METADATA.title,
    description: SEO_METADATA.description,
    ogTitle: SEO_METADATA.ogTitle,
    ogDescription: SEO_METADATA.ogDescription,
    ogImage: SEO_METADATA.ogImage,
    ogUrl: SEO_METADATA.ogUrl,
    twitterTitle: SEO_METADATA.twitterTitle,
    twitterDescription: SEO_METADATA.twitterDescription,
    twitterImage: SEO_METADATA.twitterImage,
    twitterCard: SEO_METADATA.twitterCard as 'summary_large_image' | 'summary' | 'app' | 'player' | null | undefined,
    keywords: SEO_METADATA.keywords
  })

  useHead({
    link: HEAD_META.link
  })
</script>

<style lang="scss">
  .toast-message {
    padding: 16px;
    border-radius: 8px;
    z-index: 9999 !important;
    .el-notification__group {
      margin: 0dvb;
    }
    .el-icon.el-notification__closeBtn {
      top: 16px;
      font-size: 20px;
      color: var(--color-primary);
    }
  }
</style>
