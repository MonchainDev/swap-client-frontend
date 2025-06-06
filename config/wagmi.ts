import { arbitrumSepolia, bscTestnet, polygonAmoy, sepolia } from '@wagmi/core/chains'
import { createConfig, http } from '@wagmi/vue'

import { injected, metaMask } from '@wagmi/vue/connectors'

import { CHAINS, monChain } from './chains'

export const config = createConfig({
  chains: [...CHAINS],
  connectors: [
    // MetaMask
    metaMask({ logging: { developerMode: true, sdk: true } }),
    // Coinbase Wallet (sử dụng injected thay vì walletConnect)
    injected({
      target: 'coinbaseWallet' // Chỉ định Coinbase Wallet
    }),
    // Trust Wallet
    injected({
      target: 'trustWallet' // Chỉ định Trust Wallet
    })
  ],
  transports: {
    [monChain.id]: http(),
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
