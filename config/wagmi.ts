import { sepolia, polygonAmoy, arbitrumSepolia, bscTestnet } from '@wagmi/core/chains'
import { createConfig, http } from '@wagmi/vue'

import { coinbaseWallet, metaMask } from '@wagmi/vue/connectors'

import { CHAINS, testnet } from './chains'

export const config = createConfig({
  chains: [...CHAINS],
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
    [sepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [arbitrumSepolia.id]: http(),
    [bscTestnet.id]: http()
  }
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}
