import { ChainId } from '~/types'

import type { Address, Hash } from 'viem'

/** DEPLOYER_ADDRESSES */
const DEPLOYER_ADDRESSES_BASE = '0xEFBA107c5ede093f6A0CfE3E53acf2715D94E32e'
const DEPLOYER_ADDRESSES = {
  [ChainId.MON_TESTNET]: DEPLOYER_ADDRESSES_BASE,
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xea1c0c1478a748a6bdba0e9288e269af0cc4a221',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Address>

/** POOL_INIT_CODE_HASH_BASE */
const POOL_INIT_CODE_HASH_BASE = '0xec014d553cf8e227ff815e13561fc490e9f91efce2d91baf2293cbd6a7ba98cb'
const POOL_INIT_CODE_HASHES = {
  [ChainId.MON_TESTNET]: '0xa415940637fe3d498bed0c48dfd1c0203e8caea5513e272a3749a36063a9582f',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: POOL_INIT_CODE_HASH_BASE,
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Hash>

/** NFT_POSITION_MANAGER_ADDRESS */
const NFT_POSITION_MANAGER_ADDRESS_BASE = '0x3beEDf6cE77CBdD85f04E1B5Cdd82c04d853b910'
const NFT_POSITION_MANAGER_ADDRESSES = {
  [ChainId.MON_TESTNET]: NFT_POSITION_MANAGER_ADDRESS_BASE,
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x89342a352f198f4b5726d4B1a6CbA187098EfdE0',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Address>

const FACTORY_ADDRESS_BASE = '0xF04f6ACf17C9e884D5eBE4aa6804cFD16CdEe32B'
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
  [ChainId.MON_TESTNET]: '0x49aE1Bb3C0d9bceE09611282A295aC0180494C04',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x3fFBCe2e4c0C023e43C1f529FC052a3eAb0Dc5A1',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

/** Swap Router V3 */
const swapRouterV3Addresses = {
  [ChainId.MON_TESTNET]: '0x737A8fc40BCCa63dAE76BB1f300D31078fe9a79D',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xd4D2a2D6fdD9DD28a6B9f74c1d4C42F0FE9cc6BE',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

/** LiFi Contract Address */
const lifiContractAddresses = {
  [ChainId.MON_TESTNET]: '0x4797F967C3D77A1949Fb7F429f09072dFdB6de9d',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x03e078248A4cD85633273d905d4F026C68935d0f',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

/** multicall3 */
const multicall3Addresses = {
  [ChainId.MON_TESTNET]: '0x49C0e987D9E2a85FFf40664afc8C10420905826B'
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
