export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  try {
    const rs = await fetchExchange(`transaction/collect`, 'POST', { data: body })
    return rs
  } catch (error) {
    return createError({
      statusCode: 500,
      data: { error: (error as Error)?.message },
      statusMessage: 'Internal Server Error'
    })
  }
})
