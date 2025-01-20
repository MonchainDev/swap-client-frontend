import type { NitroFetchRequest, $Fetch, NitroFetchOptions } from 'nitropack'

export const authRepository = <T>(fetch: $Fetch<T, NitroFetchRequest>) => ({
  async get(opt?: NitroFetchOptions<NitroFetchRequest, 'get'>): Promise<string> {
    return fetch('/api/user', opt)
  }
})
