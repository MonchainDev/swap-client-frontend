import type { NitroFetchRequest, $Fetch, NitroFetchOptions } from 'nitropack'
import type { IToken } from '~/types'

export const baseRepository = <T>(fetch: $Fetch<T, NitroFetchRequest>) => ({
  async getListToken(opt?: NitroFetchOptions<NitroFetchRequest, 'get'>): Promise<{ items: IToken[] }> {
    return fetch('/api/v2/tokens', opt)
  }
})
