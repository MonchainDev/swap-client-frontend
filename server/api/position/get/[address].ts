export default defineEventHandler(async (event) => {
  const address = getRouterParam(event, 'address')
  return await fetchExchange(`position/get/${address}}`, 'GET')
})
