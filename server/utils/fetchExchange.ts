import type { Method } from 'axios'
import axios from 'axios'
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

export const fetchExchange = async <T>(url: string, method: Method, opt?: NitroFetchOptions<NitroFetchRequest>): Promise<T> => {
  const config = useRuntimeConfig()
  const baseURL = config.BASE_URL_EXCHANGE_API

  const request = axios.create({
    baseURL: baseURL
  })

  const data = await request({
    method,
    url: url,
    params: {
      ...opt?.query
    },
    data: opt?.body
  })
  return data.data as T
}
