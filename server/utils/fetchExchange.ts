import type { AxiosRequestConfig, Method } from 'axios'
import axios from 'axios'

export const fetchExchange = async <T>(url: string, method: Method, opt?: AxiosRequestConfig): Promise<T> => {
  try {
    const config = useRuntimeConfig()
    const baseURL = config.BASE_URL_EXCHANGE_API

    const request = axios.create({
      baseURL: baseURL
    })

    const data = await request({
      method,
      url: url,
      params: {
        ...opt?.params
      },
      data: opt?.data
    })
    return data.data as T
  } catch (error) {
    return Promise.reject(error)
  }
}
