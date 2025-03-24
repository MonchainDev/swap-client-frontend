import { ChainId } from '~/types'

import type { Address, Hash } from 'viem'

/** DEPLOYER_ADDRESSES */
const DEPLOYER_ADDRESSES_BASE = '0xEFBA107c5ede093f6A0CfE3E53acf2715D94E32e'
const DEPLOYER_ADDRESSES = {
  [ChainId.MON_TESTNET]: DEPLOYER_ADDRESSES_BASE,
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xA2735CD027d3280208Bc8A358bA638d9a34a4e5e',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Address>

/** POOL_INIT_CODE_HASH_BASE */
const POOL_INIT_CODE_HASH_BASE = '0xec014d553cf8e227ff815e13561fc490e9f91efce2d91baf2293cbd6a7ba98cb'
const POOL_INIT_CODE_HASHES = {
  [ChainId.MON_TESTNET]: POOL_INIT_CODE_HASH_BASE,
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
  [ChainId.BSC_TESTNET]: '0xCf0184B9BB3CdD33dFDF78E132e5E3D29c9bc209',
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
  [ChainId.BSC_TESTNET]: '0xE74F82117cC021100a98320038427F991C88b8bD',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Address>

const masterChefV3Addresses = {
  [ChainId.MON_TESTNET]: '0x49aE1Bb3C0d9bceE09611282A295aC0180494C04',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x579CEB200954c0470b3f2FfE1069eef749d00F8b',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

const swapRouterV3Addresses = {
  [ChainId.MON_TESTNET]: '0x737A8fc40BCCa63dAE76BB1f300D31078fe9a79D',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xd4D2a2D6fdD9DD28a6B9f74c1d4C42F0FE9cc6BE',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

const lifiContractAddresses = {
  [ChainId.MON_TESTNET]: '0x4797F967C3D77A1949Fb7F429f09072dFdB6de9d',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x579CEB200954c0470b3f2FfE1069eef749d00F8b',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

export default {
  nftPositionManager: NFT_POSITION_MANAGER_ADDRESSES,
  v3PoolDeployer: DEPLOYER_ADDRESSES,
  poolInitCodeHash: POOL_INIT_CODE_HASHES,
  factory: FACTORY_ADDRESSES,
  masterChefV3: masterChefV3Addresses,
  swapRouterV3: swapRouterV3Addresses,
  lifiContractAddress: lifiContractAddresses
}
