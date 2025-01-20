// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    "rules": {
      "@typescript-eslint/no-unused-vars": "error",
      'vue/no-multiple-template-root': 'off',
      "vue/html-self-closing": ["error", {
        "html": {
          "void": "any",
          "normal": "any",
          "component": "always"
        }
      }]
    }
  }
)