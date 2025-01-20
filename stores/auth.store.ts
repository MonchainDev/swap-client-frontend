import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const userAddress = ref<string | null | undefined>(null)
  const isLogged = computed(() => Boolean(userAddress.value))

  return { userAddress, isLogged }
})
