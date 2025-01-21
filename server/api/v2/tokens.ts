export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const data: unknown = await $fetch('/api/v2/tokens', { baseURL: config.BASE_URL_API, method: 'GET' })
  return data
})
