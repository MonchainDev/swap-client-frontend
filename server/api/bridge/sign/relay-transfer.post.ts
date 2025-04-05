import axios from 'axios'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('>>> / body:', body)

    const config = useRuntimeConfig()
    const baseURL = config.BASE_URL_BRIDGE_API || 'https://api-bridge.monchain.info/'

    const rs = await axios.post(`${baseURL}api/v1/sign/relay-transfer`, body)
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
