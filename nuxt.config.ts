// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: true,
  runtimeConfig: {
    BASE_URL_API: process.env.VITE_BASE_URL_API
  },
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/test-utils/module',
    '@element-plus/nuxt',
    '@nuxtjs/google-fonts',
    'nuxt-svgo',
    'nuxt-lodash'
    // '@nuxthub/core'
  ],
  experimental: {
    typedPages: true
  },
  appConfig: {
    baseUrl: 'https://api.nuxt.com'
  },
  tailwindcss: {
    cssPath: '~/assets/styles/tailwind.css'
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],
  googleFonts: {
    families: {
      Poppins: [400, 500, 600, 700],
      Roboto: [400, 500, 600]
    },
    display: 'swap',
    preload: true,
    useStylesheet: true
  },
  svgo: {
    autoImportPath: '~/assets/icons',
    customComponent: 'BaseIcon',
    svgoConfig: {
      multipass: true,
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              // customize default plugin options
              inlineStyles: {
                onlyMatchedOnce: false
              },

              // or disable plugins
              removeDoctype: false,
              removeViewBox: false
            }
          }
        }
      ]
    }
  }
})
