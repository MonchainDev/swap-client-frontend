import { GraphQLClient } from 'graphql-request'
import { URL_GRAPH } from '~/config/graphql'
import type { ChainId } from '~/types'

export const getGraphQLClient = (chainId: number) => {
  const url = URL_GRAPH[chainId as ChainId]
  if (!url) {
    throw new Error(`Unsupported chainId: ${chainId}`)
  }
  return new GraphQLClient(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
