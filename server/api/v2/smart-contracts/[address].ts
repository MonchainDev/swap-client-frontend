export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const address = getRouterParam(event, 'address')

  const data: unknown = await $fetch(`/api/v2/smart-contracts/${address}`, { baseURL: config.BASE_URL_API, method: 'GET' })
  return data
})
