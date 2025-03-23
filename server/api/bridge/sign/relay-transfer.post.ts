import axios from "axios"

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const rs = await axios.post(`https://api-bridge.monchain.info/api/v1/sign/relay-transfer`,body )
    return rs
  } catch (error: any) {
    return createError({
      statusCode: 400,
      data: { error: error?.code || (error as Error)?.message },
      statusMessage: 'Internal Server Error'
    })
  }
})
