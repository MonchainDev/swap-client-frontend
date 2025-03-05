export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const paramString = toQueryString(query)
  return await fetchExchange(`pool/search/1/1000?${paramString}`, 'GET')
})

function toQueryString(params: Record<string, unknown>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, values]) => {
    if (!Array.isArray(values)) {
      values = [values]
    }
    ;(values as unknown[]).forEach((value) => searchParams.append(key, value as string))
  })

  return searchParams.toString()
}
