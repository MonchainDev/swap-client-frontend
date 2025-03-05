export default defineNuxtRouteMiddleware(() => {
  const { resetStore } = useSwapStore()
  resetStore()
})
