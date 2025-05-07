import { arbitrumSepolia, sepolia } from 'viem/chains'
import { ChainId } from '~/types'

export const PUBLIC_NODES: Record<ChainId, string[] | readonly string[]> = {
  [ChainId.MON_TESTNET]: ['https://testnet-rpc1.wicchain.com'],
  [ChainId.BSC_TESTNET]: ['https://bsc-testnet-rpc.publicnode.com'],
  [ChainId.SEPOLIA]: sepolia.rpcUrls.default.http,
  [ChainId.ARBITRUM_SEPOLIA]: arbitrumSepolia.rpcUrls.default.http,
  [ChainId.AMOY_POLYGON]: ['https://rpc-amoy.polygon.technology/']
}
