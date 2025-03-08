export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return await fetchExchange(`transaction/get`, 'GET', { params: query })
})
