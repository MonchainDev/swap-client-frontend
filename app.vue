<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
  useSeoMeta({
    title: 'MonChain - Swap & Trade Crypto with Ease',
    description: 'MonChain is a cutting-edge decentralized exchange (DEX) enabling seamless crypto swaps and trades with low fees and high security.',
    ogTitle: 'MonChain - Swap & Trade Crypto with Ease',
    ogDescription: 'Trade and swap cryptocurrencies securely on MonChain, a next-gen DEX with lightning-fast transactions and low fees.',
    ogImage: '/og-preview.png',
    ogUrl: 'https://swap.monchain.info',
    twitterTitle: 'MonChain - The Future of Crypto Trading',
    twitterDescription: 'Experience fast, secure, and low-cost crypto trading with MonChain. Join the decentralized revolution today!',
    twitterImage: '/og-preview.png',
    twitterCard: 'summary_large_image',
    keywords: 'MonChain, crypto swap, decentralized exchange, DEX, trade crypto, DeFi, blockchain trading, Web3'
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
