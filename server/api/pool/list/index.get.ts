export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  console.log('🚀 ~ defineEventHandler ~ query:', query)
  const page = query.page || 1
  const pageSize = query.pageSize || 1000
  const paramString = toQueryString(query)
  console.log('🚀 ~ defineEventHandler ~ paramString:', paramString)
  return await fetchExchange(`pool/search/${page}/${pageSize}?${paramString}`, 'GET')
})

function toQueryString(params: Record<string, unknown>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, values]) => {
    if (!values) return

    if (!Array.isArray(values)) {
      values = [values]
    }

    if (Array.isArray(values) && values.length === 0) return
    ;(values as string[]).forEach((value: string) => searchParams.append(key, value))
  })

  return searchParams.toString()
}
