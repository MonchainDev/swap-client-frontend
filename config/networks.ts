import { WNATIVE } from '~/config/tokens'
import { ChainId, type INetwork } from '~/types'
import { URL_GRAPH } from './graphql'
import { PUBLIC_NODES } from './nodes'

const DEFAULT_NETWORK: INetwork = {
  name: 'Mon Chain',
  logo: '/logo-mon-chain.png',
  chainId: ChainId.MON_TESTNET,
  id: 1,
  network: 'MON',
  rpc: PUBLIC_NODES[ChainId.MON_TESTNET][0],
  graphUrl: URL_GRAPH[ChainId.MON_TESTNET],
  nativeToken: 'MON',
  wrapToken: 'WMON',
  wrapTokenAddress: WNATIVE[ChainId.MON_TESTNET].address,
  stableTokenAddress: '0x8071be23b8946dd6a9914f3d6d3ab8938241671f',
  lifiContractAddress: null
}

const LIST_NETWORK: INetwork[] = [
  DEFAULT_NETWORK,
  {
    id: 3,
    name: 'BNB Chain',
    logo: '/logo-bnb-chain.png',
    chainId: ChainId.BSC_TESTNET,
    network: 'BSC',
    rpc: PUBLIC_NODES[ChainId.BSC_TESTNET][0],
    graphUrl: URL_GRAPH[ChainId.BSC_TESTNET],
    nativeToken: 'BNB',
    wrapToken: 'WBNB',
    wrapTokenAddress: WNATIVE[ChainId.BSC_TESTNET].address,
    stableTokenAddress: '0x2a4b180da0a45a5ae65f230c228de0d4de0b7057',
    lifiContractAddress: null
  },
  {
    name: 'Ethereum',
    logo: '/logo-ethereum-chain.png',
    chainId: ChainId.SEPOLIA,
    id: 2,
    network: 'ETH',
    rpc: PUBLIC_NODES[ChainId.SEPOLIA][0],
    graphUrl: URL_GRAPH[ChainId.SEPOLIA],
    nativeToken: 'ETH',
    wrapToken: 'WETH',
    wrapTokenAddress: WNATIVE[ChainId.SEPOLIA].address,
    stableTokenAddress: '',
    lifiContractAddress: null
  },
  {
    name: 'Polygon',
    logo: '/logo-polygon-chain.png',
    chainId: ChainId.AMOY_POLYGON,
    id: 4,
    network: 'POLYGON',
    rpc: PUBLIC_NODES[ChainId.AMOY_POLYGON][0],
    graphUrl: URL_GRAPH[ChainId.AMOY_POLYGON],
    nativeToken: 'POL',
    wrapToken: 'WPOL',
    wrapTokenAddress: WNATIVE[ChainId.AMOY_POLYGON].address,
    stableTokenAddress: '',
    lifiContractAddress: null
  },
  {
    name: 'Arbitrum Sepolia',
    logo: '/arbitrum-arb-logo.png',
    chainId: ChainId.ARBITRUM_SEPOLIA,
    id: 5,
    network: 'ARBITRUM',
    rpc: PUBLIC_NODES[ChainId.ARBITRUM_SEPOLIA][0],
    graphUrl: URL_GRAPH[ChainId.ARBITRUM_SEPOLIA],
    nativeToken: 'ETH',
    wrapToken: 'WETH',
    wrapTokenAddress: WNATIVE[ChainId.ARBITRUM_SEPOLIA].address,
    stableTokenAddress: '',
    lifiContractAddress: null
  }
]

const NETWORK_NAMES: Record<ChainId, string> = {
  [ChainId.MON_TESTNET]: 'Mon Chain',
  [ChainId.BSC_TESTNET]: 'BNB Chain',
  [ChainId.SEPOLIA]: 'Ethereum',
  [ChainId.AMOY_POLYGON]: 'Polygon',
  [ChainId.ARBITRUM_SEPOLIA]: 'Arbitrum Sepolia'
}

const NETWORK_SUPPORTED = Object.fromEntries(LIST_NETWORK.map((network) => [network.network, true])) as Record<string, boolean>

export { DEFAULT_NETWORK, LIST_NETWORK, NETWORK_NAMES, NETWORK_SUPPORTED }
