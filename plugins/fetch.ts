import { BASE_URL_API } from '~/constant'

export default defineNuxtPlugin(() => {
  const accessToken = useCookie('access_token')
  // const config = useRuntimeConfig()

  const fetch = $fetch.create({
    baseURL: BASE_URL_API,
    onRequest({ options }) {
      if (accessToken.value) {
        options.headers = { ...options.headers }
      }
    },
    onResponse() {
      // response._data = new myBusinessResponse(response._data)
    },
    onResponseError({ response }) {
      console.error('onResponseError', response)
    }
  })
  // Expose to useNuxtApp().fetch
  return {
    provide: {
      fetch
    }
  }
})
