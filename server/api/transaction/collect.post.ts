export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await fetchExchange(`transaction/collect`, 'POST', { data: body })
})
