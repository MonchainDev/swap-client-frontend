import { type Chain } from 'viem'
import { arbitrumSepolia, bscTestnet, polygonAmoy, sepolia } from 'viem/chains'

export const testnet = {
  id: 16_789,
  name: 'Monchain Testnet',
  nativeCurrency: { name: 'Mon', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.monchain.info'] }
  },
  blockExplorers: {
    default: { name: 'Monscan', url: 'https://explorer.monchain.info/', apiUrl: 'https://explorer.monchain.info/api/v2' }
  },
  contracts: {
    multicall3: {
      address: '0x49C0e987D9E2a85FFf40664afc8C10420905826B',
      blockCreated: 31208
    }
  },
  testnet: true
} as const satisfies Chain

export const CHAINS: [Chain, ...Chain[]] = [testnet, sepolia, polygonAmoy, arbitrumSepolia, bscTestnet]
