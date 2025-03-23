export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return await fetchExchange(`position/list`, 'GET', { params: query })
})
