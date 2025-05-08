import { arbitrumSepolia, sepolia } from 'viem/chains'
import { ChainId } from '~/types'

export const PUBLIC_NODES: Record<ChainId, string[] | readonly string[]> = {
  [ChainId.MON_TESTNET]: ['https://testnet-rpc1.wicchain.com'],
  [ChainId.BSC_TESTNET]: ['https://bsc-testnet.core.chainstack.com/529dab3b4d0890fa790c5ed475bcda6d'],
  [ChainId.SEPOLIA]: sepolia.rpcUrls.default.http,
  [ChainId.ARBITRUM_SEPOLIA]: arbitrumSepolia.rpcUrls.default.http,
  [ChainId.AMOY_POLYGON]: ['https://rpc-amoy.polygon.technology/']
}
