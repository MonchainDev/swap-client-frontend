export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return await fetchExchange(`network/all`, 'GET', { params: query })
})
