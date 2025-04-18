import { ChainId } from '~/types'

const URL_GRAPH = {
  [ChainId.MON_TESTNET]: 'https://graph-node.monchain.info/subgraphs/name/v3',
  [ChainId.AMOY_POLYGON]: 'https://graph-polygon.monchain.info/subgraphs/name/v3',
  [ChainId.BSC_TESTNET]: 'https://graph-bsc.monchain.info/subgraphs/name/v4',
  [ChainId.SEPOLIA]: 'https://graph-eth.monchain.info/subgraphs/name/v3',
  [ChainId.ARBITRUM_SEPOLIA]: 'https://graph-arbitrum.monchain.info/subgraphs/name/v3'
} as const satisfies Record<ChainId, string>

export { URL_GRAPH }
