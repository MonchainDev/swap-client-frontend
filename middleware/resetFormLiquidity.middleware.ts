export default defineNuxtRouteMiddleware(() => {
  const { resetStore } = useLiquidityStore()
  resetStore()
})
