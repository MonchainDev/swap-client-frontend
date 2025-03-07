export default defineEventHandler(async (event) => {
  const address = getRouterParam(event, 'address')
  const query = getQuery(event)
  return await fetchExchange(`pool/get/${address}?network=${query?.network}`, 'GET')
})
