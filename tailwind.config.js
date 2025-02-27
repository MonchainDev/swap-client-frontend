/** @type {import('tailwindcss').Config} */
export default {
  content: ['./components/**/*.{js,vue,ts}', './layouts/**/*.vue', './pages/**/*.vue', './plugins/**/*.{js,ts}', './app.vue', './error.vue'],
  theme: {
    container: {
      center: true
    },
    extend: {},
    colors: {
      primary: 'var(--color-primary)',
      'gray-2': 'var(--color-gray-2)',
      'gray-3': 'var(--color-gray-3)',
      'gray-4': 'var(--color-gray-4)',
      'gray-6': 'var(--color-gray-6)',
      'gray-7': 'var(--color-gray-7)',
      'gray-8': 'var(--color-gray-8)',
      warning: 'var(--color-warning)',
      white: '#fff',
      error: 'var(--color-error)',
      transparent: 'transparent',
      hyperlink: 'var(--color-hyperlink)',
      'linear-gradient': 'var(--color-linear-gradient)'
    },
    screens: {
      xxl: {
        max: '1400px'
      },
      xl: {
        max: '1200px'
      },
      lg: {
        max: '1023px'
      },
      sm: {
        max: '767px'
      },
      xs: {
        max: '374'
      }
    }
  },
  plugins: []
}
