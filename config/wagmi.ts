import { createConfig, http } from '@wagmi/vue'
import { coinbaseWallet, metaMask } from '@wagmi/vue/connectors'

import { type Chain } from 'viem'

export const testnet = {
  id: 16_788,
  name: 'Monchain Testnet',
  nativeCurrency: { name: 'Mon', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.monchain.info'] }
  },
  blockExplorers: {
    default: { name: 'Monscan', url: 'https://explorer.monchain.info', apiUrl: 'https://explorer.monchain.info/api/v2' }
  },
  testnet: true
} as const satisfies Chain

export const config = createConfig({
  chains: [testnet],
  connectors: [metaMask(), coinbaseWallet()],
  transports: {
    [testnet.id]: http()
  }
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}
