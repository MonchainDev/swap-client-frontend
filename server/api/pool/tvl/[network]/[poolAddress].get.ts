export default defineEventHandler(async (event) => {
  const network = getRouterParam(event, 'network')
  const poolAddress = getRouterParam(event, 'poolAddress')
  const query = getQuery(event)
  const period = query?.period || '1Y'
  return await fetchExchange(`pool/tvl/${network}/${poolAddress}?period=${period}`, 'GET')
})
