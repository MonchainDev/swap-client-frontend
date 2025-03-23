import type { AxiosRequestConfig, Method } from 'axios'
import axios from 'axios'

export const fetchBridge = async <T>(url: string, method: Method, opt?: AxiosRequestConfig): Promise<T> => {
  try {
    const config = useRuntimeConfig()
    const baseURL = config.BASE_URL_BRIDGE_API || 'https://api-bridge.monchain.info'

    const request = axios.create({
      baseURL: baseURL,
    })
    request.interceptors.response.use((response) => {
      console.log('response', response);
      return response
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
  } catch (error: any) {
    return Promise.reject({
      code: error?.config?.code,
      status: error?.config?.status || 500,
      url: error?.config?.url || url,
    })
  }
}
