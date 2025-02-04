/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    container:{
      center:true,
    },
    extend: {},
    colors:{
      primary:'var(--color-primary)',
      'gray-3': 'var(--color-gray-3)',
      'gray-4': 'var(--color-gray-4)',
      'gray-6':'var(--color-gray-6)',
      'gray-8': 'var(--color-gray-8)',
      surface:'var(--color-surface)',
      surface2:'var(--color-surface2)',
      surface3:'var(--color-surface3)',
      neutral3:'var(--color-neutral3)',
      white:'#fff',
      pink:'var(--color-pink)',
      transparent:'transparent',
      hyperlink: 'var(--color-hyperlink)',
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
    },
  },
  plugins: [],
}

