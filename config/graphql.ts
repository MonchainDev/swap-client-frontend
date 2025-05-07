import { ChainId } from '~/types'

const URL_GRAPH = {
  [ChainId.MON_TESTNET]: 'http://66.179.80.118:8000/subgraphs/name/v3',
  [ChainId.AMOY_POLYGON]: 'https://graph-polygon.monchain.info/subgraphs/name/v3',
  [ChainId.BSC_TESTNET]: 'http://66.179.80.117:8000/subgraphs/name/v3',
  [ChainId.SEPOLIA]: 'https://graph-eth.monchain.info/subgraphs/name/v3',
  [ChainId.ARBITRUM_SEPOLIA]: 'https://graph-arbitrum.monchain.info/subgraphs/name/v3'
} as const satisfies Record<ChainId, string>

export { URL_GRAPH }
