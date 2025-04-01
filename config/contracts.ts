import { ChainId } from '~/types'

import type { Address, Hash } from 'viem'

/** DEPLOYER_ADDRESSES */
const DEPLOYER_ADDRESSES_BASE = '0xF9012437655F666bcB07f50Cc471f531629342Df'
const DEPLOYER_ADDRESSES = {
  [ChainId.MON_TESTNET]: DEPLOYER_ADDRESSES_BASE,
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xea1c0c1478a748a6bdba0e9288e269af0cc4a221',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Address>

/** POOL_INIT_CODE_HASH_BASE */
const POOL_INIT_CODE_HASH_BASE = '0xa415940637fe3d498bed0c48dfd1c0203e8caea5513e272a3749a36063a9582f'
const POOL_INIT_CODE_HASHES = {
  [ChainId.MON_TESTNET]: POOL_INIT_CODE_HASH_BASE,
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: POOL_INIT_CODE_HASH_BASE,
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Hash>

/** NFT_POSITION_MANAGER_ADDRESS */
const NFT_POSITION_MANAGER_ADDRESS_BASE = '0xD1D4B9D291DDbDCa04349A7De6278db723b645b9'
const NFT_POSITION_MANAGER_ADDRESSES = {
  [ChainId.MON_TESTNET]: NFT_POSITION_MANAGER_ADDRESS_BASE,
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x89342a352f198f4b5726d4B1a6CbA187098EfdE0',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Address>

const FACTORY_ADDRESS_BASE = '0x40e8fF67E3A86B6dB964e26C875662ed55B77690'
/**
 * To compute Pool address use DEPLOYER_ADDRESSES instead
 */
const FACTORY_ADDRESSES = {
  [ChainId.MON_TESTNET]: FACTORY_ADDRESS_BASE,
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x00e843420A311f972F68C32d905921d17772B6A6',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Address>

/** MasterChef V3 */
const masterChefV3Addresses = {
  [ChainId.MON_TESTNET]: '0x223eFB61a5f1c766A5fC7F637435251a91C356CA',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x3fFBCe2e4c0C023e43C1f529FC052a3eAb0Dc5A1',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

/** Swap Router V3 */
const swapRouterV3Addresses = {
  [ChainId.MON_TESTNET]: '0xd3a075c688Ce2DCDef4C41D4CE88ceb5247B76A8',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xd4D2a2D6fdD9DD28a6B9f74c1d4C42F0FE9cc6BE',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

/** LiFi Contract Address */
const lifiContractAddresses = {
  [ChainId.MON_TESTNET]: '0xfFcB4378ef90F7e5508EAe3A85e6F31970105020',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x03e078248A4cD85633273d905d4F026C68935d0f',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

/** multicall3 */
const multicall3Addresses = {
  [ChainId.MON_TESTNET]: '0xCaB7cFe801286f0cD82b0d9bd12b3Feb6CbDb18B'
} as const satisfies Record<number, `0x${string}`>

export default {
  nftPositionManager: NFT_POSITION_MANAGER_ADDRESSES,
  v3PoolDeployer: DEPLOYER_ADDRESSES,
  poolInitCodeHash: POOL_INIT_CODE_HASHES,
  factory: FACTORY_ADDRESSES,
  masterChefV3: masterChefV3Addresses,
  swapRouterV3: swapRouterV3Addresses,
  lifiContractAddress: lifiContractAddresses,
  multicall3Addresses
}
