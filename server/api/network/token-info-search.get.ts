export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const paramString = toQueryString(query)
  return await fetchExchange(`network/token-info-search?${paramString}`, 'GET')
})
