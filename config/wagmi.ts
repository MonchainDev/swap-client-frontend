import { sepolia } from '@wagmi/core/chains'
import { createConfig, http } from '@wagmi/vue'

import { coinbaseWallet, metaMask } from '@wagmi/vue/connectors'

import { type Chain } from 'viem'

export const testnet = {
  id: 16_789,
  name: 'Monchain Testnet',
  nativeCurrency: { name: 'Mon', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.monchain.info'] }
  },
  blockExplorers: {
    default: { name: 'Monscan', url: 'https://dev.explorer.hdev99.io.vn/', apiUrl: 'https://explorer.monchain.info/api/v2' }
  },
  testnet: true
} as const satisfies Chain

export const config = createConfig({
  chains: [testnet, sepolia],
  connectors: [
    metaMask(),
    coinbaseWallet()
    // walletConnect({
    //   projectId: '001368a92a97b7f25233d5631fd4d524',
    //   isNewChainsStale: true,
    //   metadata: {
    //     name: 'Monchain',
    //     description: 'Monchain WalletConnect',
    //     url: 'https://dex-swap.datdev.me',
    //     icons: ['https://dex-swap.datdev.me/logo.png']
    //   }
    // })
  ],
  transports: {
    [testnet.id]: http(),
    [sepolia.id]: http()
  }
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}
