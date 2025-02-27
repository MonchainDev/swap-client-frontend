export default defineNuxtRouteMiddleware(() => {
  const { popup } = storeToRefs(useBaseStore())
  popup.value = []
})
