export default defineEventHandler(async (event) => {
  const tokenId = getRouterParam(event, 'tokenId')
  const query = getQuery(event)
  return await fetchExchange(`position/get/${tokenId}?network=${query.network}`, 'GET')
})
