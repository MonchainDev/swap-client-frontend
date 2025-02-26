export default defineNuxtRouteMiddleware(() => {
  console.log('vao day')

  const { popup } = storeToRefs(useBaseStore())
  popup.value = []
})
