import { ChainId } from '@monchain/chains'
import first from 'lodash/first'
import { type PublicClient, createPublicClient, fallback, http } from 'viem'
import { mainnet } from 'viem/chains'

import { CHAINS } from './config/chains'
import { PUBLIC_NODES } from './config/nodes'

export type CreatePublicClientParams = {
  transportSignal?: AbortSignal
}

export function createViemPublicClients({ transportSignal }: CreatePublicClientParams = {}) {
  console.log(CHAINS);

  const result: Record<ChainId, PublicClient> = {};

  for (const cur of CHAINS) {
    const nodes = PUBLIC_NODES[cur.id as ChainId] as string[];
    console.info(" (viem.ts:18) nodes", cur.id, nodes);
    if (!nodes) continue;

    result[cur.id as ChainId] = createPublicClient({
      chain: cur,
      transport: fallback(
          (PUBLIC_NODES[cur.id as ChainId] as string[]).map((url) =>
              http(url, {
                timeout: 10_000,
                fetchOptions: {
                  signal: transportSignal,
                },
              })
          ),
          {
            rank: false,
          }
      ),
      batch: {
        multicall: {
          batchSize: cur.id === ChainId.POLYGON_ZKEVM ? 128 : 1024 * 25,
          wait: 16,
        },
      },
      pollingInterval: 6_000,
    });
  }

  return result;
}

export const viemClients = createViemPublicClients()

export const getViemClients = createViemPublicClientGetter({ viemClients })

type CreateViemPublicClientGetterParams = {
  viemClients?: Record<ChainId, PublicClient>
} & CreatePublicClientParams

export function createViemPublicClientGetter({
  viemClients: viemClientsOverride,
  ...restParams
}: CreateViemPublicClientGetterParams = {}) {
  const clients = viemClientsOverride || createViemPublicClients(restParams)

  return function getClients({ chainId }: { chainId?: ChainId }): PublicClient {
    const client = clients[chainId as ChainId]
    console.info(" (viem.ts:67) client", client);
    return client
  }
}

const PUBLIC_MAINNET = 'https://ethereum.publicnode.com'

export const CLIENT_CONFIG = {
  batch: {
    multicall: {
      batchSize: 1024 * 200,
      wait: 16,
    },
  },
  pollingInterval: 6_000,
}

export const publicClient = ({ chainId }: { chainId?: ChainId }) => {
  if (chainId && viemClients[chainId]) {
    return viemClients[chainId]
  }
  let httpString: string | undefined

  if (process.env.NODE_ENV === 'test' && chainId === mainnet.id) {
    httpString = PUBLIC_MAINNET
  } else {
    httpString = chainId && first(PUBLIC_NODES[chainId]) ? first(PUBLIC_NODES[chainId]) : undefined
  }

  const chain = CHAINS.find((c) => c.id === chainId)
  return createPublicClient({ chain, transport: http(httpString), ...CLIENT_CONFIG })
}
