import toQueryString from '~/server/utils/toQueryString'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  console.log('🚀 ~ defineEventHandler ~ query:', query)
  const page = query.page || 1
  const pageSize = query.pageSize || 1000
  const paramString = toQueryString(query)
  console.log('🚀 ~ defineEventHandler ~ paramString:', paramString)
  return await fetchExchange(`pool/search/${page}/${pageSize}?${paramString}`, 'GET')
})
