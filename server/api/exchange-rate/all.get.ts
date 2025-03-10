export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const paramString = toQueryString(query)
  return await fetchExchange(`exchange-rate/all?${paramString}`, 'GET')
})
