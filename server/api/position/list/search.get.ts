import toQueryString from '~/server/utils/toQueryString'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = query.page || 1
  const pageSize = query.pageSize || 1000
  const paramString = toQueryString(query)
  console.log('🚀 ~ defineEventHandler ~ paramString:', `position/search/${page}/${pageSize}?${paramString}`)
  return await fetchExchange(`position/search/${page}/${pageSize}?${paramString}`, 'GET')
})
