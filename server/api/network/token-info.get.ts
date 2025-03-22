export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return await fetchExchange(`network/token-info`, 'GET', { params: query })
})
