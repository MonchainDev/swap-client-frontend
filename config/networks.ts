import { ChainId, type INetwork } from '~/types'

const DEFAULT_NETWORK: INetwork = {
  name: 'Mon Chain',
  logo: '/logo-mon-chain.png',
  chainId: ChainId.MON_TESTNET,
  id: 1,
  network: 'MON',
  rpc: 'https://rpc-testnet.monchain.info',
  graphUrl: 'https://graph-mon.monchain.info/subgraphs/name/v3',
  nativeToken: 'MON',
  wrapToken: 'WMON',
  wrapTokenAddress: '0xF9012437655F666bcB07f50Cc471f531629342Df',
  stableTokenAddress: '0x8071be23b8946dd6a9914f3d6d3ab8938241671f'
}

const LIST_NETWORK: INetwork[] = [
  DEFAULT_NETWORK,
  {
    id: 3,
    name: 'BNB Chain',
    logo: '/logo-bnb-chain.png',
    chainId: ChainId.BSC_TESTNET,
    network: 'BSC',
    rpc: 'https://bsc-testnet-rpc.publicnode.com',
    graphUrl: 'https://graph-bnb.monchain.info/subgraphs/name/v3',
    nativeToken: 'BNB',
    wrapToken: 'WBNB',
    wrapTokenAddress: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    stableTokenAddress: '0x2a4b180da0a45a5ae65f230c228de0d4de0b7057'
  },
  {
    name: 'Ethereum',
    logo: '/logo-ethereum-chain.png',
    chainId: ChainId.SEPOLIA,
    id: 2,
    network: 'ETH',
    rpc: 'https://sepolia.infura.io',
    graphUrl: 'https://graph-eth.monchain.info/subgraphs/name/v3',
    nativeToken: 'ETH',
    wrapToken: 'WETH',
    wrapTokenAddress: '0xf531B8F309Be94191af87605CfBf600D71C2cFe0',
    stableTokenAddress: ''
  },
  {
    name: 'Polygon',
    logo: '/logo-polygon-chain.png',
    chainId: ChainId.AMOY_POLYGON,
    id: 4,
    network: 'POLYGON',
    rpc: 'https://rpc-amoy.polygon.technology',
    graphUrl: 'https://graph-polygon.monchain.info/subgraphs/name/v3',
    nativeToken: 'POL',
    wrapToken: 'WPOL',
    wrapTokenAddress: '0xA5733b3A8e62A8faF43b0376d5fAF46E89B3033E',
    stableTokenAddress: ''
  },
  {
    name: 'Arbitrum Sepolia',
    logo: '/arbitrum-arb-logo.png',
    chainId: ChainId.ARBITRUM_SEPOLIA,
    id: 5,
    network: 'ARBITRUM',
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    graphUrl: 'https://graph-arbitrum.monchain.info/subgraphs/name/v3',
    nativeToken: 'ETH',
    wrapToken: 'WETH',
    wrapTokenAddress: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73',
    stableTokenAddress: ''
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

export { DEFAULT_NETWORK, LIST_NETWORK, NETWORK_SUPPORTED, NETWORK_NAMES }
