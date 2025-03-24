export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const rs = await fetchBridge(`/api/v1/fee/relay-transfer`, 'POST', { data: body })
    return rs
  } catch (error: unknown) {
    return createError({
      statusCode: 400,
      //@ts-ignore
      data: { error: error?.code || (error as Error)?.message },
      statusMessage: 'Internal Server Error'
    })
  }
})
