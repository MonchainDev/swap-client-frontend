import axios from 'axios'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('>>> / body:', body)

    const rs = await axios.post(`https://api-bridge.monchain.info/api/v1/sign/relay-transfer`, body)
    return rs.data
  } catch (error: unknown) {
    return createError({
      statusCode: 400,
      //@ts-ignore
      data: { error: error?.code || (error as Error)?.message },
      statusMessage: 'Internal Server Error'
    })
  }
})
