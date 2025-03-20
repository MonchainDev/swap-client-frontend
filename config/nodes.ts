import { arbitrumSepolia, sepolia } from 'viem/chains'
import { ChainId } from '~/types'

// import { ChainId } from '@monchain/chains'

export const PUBLIC_NODES: Record<ChainId, string[] | readonly string[]> = {
  [ChainId.MON_TESTNET]: ['https://rpc-testnet.monchain.info'],
  [ChainId.BSC_TESTNET]: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
  [ChainId.SEPOLIA]: sepolia.rpcUrls.default.http,
  [ChainId.ARBITRUM_SEPOLIA]: arbitrumSepolia.rpcUrls.default.http,
  [ChainId.AMOY_POLYGON]: ['https://rpc-amoy.polygon.technology/']
}
