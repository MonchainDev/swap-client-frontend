import first from 'lodash/first'
import type { PublicClient } from 'viem'
import { createPublicClient, fallback, http } from 'viem'

import { CHAINS } from '~/config/chains'
import { PUBLIC_NODES } from '~/config/nodes'
import type { ChainId } from '~/types'

export type CreatePublicClientParams = {
  transportSignal?: AbortSignal
}

export function createViemPublicClients({ transportSignal }: CreatePublicClientParams = {}) {
  return CHAINS.reduce(
    (prev, cur) => {
      return {
        ...prev,
        [cur.id]: createPublicClient({
          chain: cur,
          transport: fallback(
            //@ts-ignore
            (PUBLIC_NODES[cur.id] as string[]).map((url) =>
              http(url, {
                timeout: 60_000, // 60 seconds
                retryCount: 3,
                fetchOptions: {
                  signal: transportSignal
                },
                onFetchResponse(response) {
                  if (response.status !== 200) {
                    console.error(`RPC response issue from ${url}: ${response.status}`)
                  }
                }
              })
            ),
            {
              rank: false
            }
          ),
          batch: {
            multicall: {
              batchSize: 1024 * 25,
              wait: 16
            }
          },
          pollingInterval: 6_000
        })
      }
    },
    {} as Record<ChainId, PublicClient>
  )
}

export const viemClients = createViemPublicClients()

export const getViemClients = createViemPublicClientGetter({ viemClients })

type CreateViemPublicClientGetterParams = {
  viemClients?: Record<ChainId, PublicClient>
} & CreatePublicClientParams

export function createViemPublicClientGetter({ viemClients: viemClientsOverride, ...restParams }: CreateViemPublicClientGetterParams = {}) {
  const clients = viemClientsOverride || createViemPublicClients(restParams)

  return function getClients({ chainId }: { chainId?: ChainId }): PublicClient {
    return clients[chainId as ChainId]
  }
}

export const CLIENT_CONFIG = {
  batch: {
    multicall: {
      batchSize: 1024 * 25, // 25KB
      wait: 16
    }
  },
  pollingInterval: 6_000
}

export const publicClient = ({ chainId }: { chainId?: ChainId }) => {
  // if (chainId && viemClients[chainId]) {
  //   console.log(viemClients)
  //   return viemClients[chainId]
  // }

  console.log('publicClient', chainId)

  const httpString = chainId && first(PUBLIC_NODES[chainId]) ? first(PUBLIC_NODES[chainId]) : undefined

  const chain = CHAINS.find((c) => c.id === chainId)
  return createPublicClient({
    chain,
    transport: http(httpString, {
      timeout: 60_000,
      retryCount: 3
    }),
    ...CLIENT_CONFIG
  })
}
