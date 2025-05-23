import { type Chain } from 'viem'
import { arbitrumSepolia, bscTestnet, polygonAmoy, sepolia } from 'viem/chains'
import { PUBLIC_NODES } from './nodes'
import { ChainId } from '~/types'
import { DOMAIN_SCAN } from './scan'
import contracts from './contracts'

export const monChain = {
  id: 16_789,
  name: 'Monchain Testnet',
  nativeCurrency: { name: 'Mon', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: PUBLIC_NODES[ChainId.MON_TESTNET] }
  },
  blockExplorers: {
    default: { name: 'Monscan', url: DOMAIN_SCAN[ChainId.MON_TESTNET], apiUrl: process.env.VITE_BASE_URL_EXPLORER_API }
  },
  contracts: {
    multicall3: {
      address: contracts.multicall3Addresses[ChainId.MON_TESTNET],
      blockCreated: 31208
    }
  },
  testnet: true
} as const satisfies Chain

export const CHAINS: [Chain, ...Chain[]] = [monChain, sepolia, polygonAmoy, arbitrumSepolia, bscTestnet]
