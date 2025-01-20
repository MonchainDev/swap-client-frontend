import { BASE_URL_API } from '~/constant'

export default defineEventHandler(async () => {
  console.log('🚀 ~ BASE_URL_API:', BASE_URL_API)

  const data: unknown = await $fetch('/api/v2/tokens', { baseURL: BASE_URL_API, method: 'GET' })
  return data
})
