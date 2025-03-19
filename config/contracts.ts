import { ChainId } from '~/types'

import type { Address, Hash } from 'viem'

/** DEPLOYER_ADDRESSES */
const DEPLOYER_ADDRESSES_BASE = '0xEFBA107c5ede093f6A0CfE3E53acf2715D94E32e'
const DEPLOYER_ADDRESSES = {
  [ChainId.MON_TESTNET]: DEPLOYER_ADDRESSES_BASE,
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xea1c0c1478A748a6bDBA0E9288e269af0cC4A221',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Address>

/** POOL_INIT_CODE_HASH_BASE */
const POOL_INIT_CODE_HASH_BASE = '0xec014d553cf8e227ff815e13561fc490e9f91efce2d91baf2293cbd6a7ba98cb'
const POOL_INIT_CODE_HASHES = {
  [ChainId.MON_TESTNET]: POOL_INIT_CODE_HASH_BASE,
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Hash>

/** NFT_POSITION_MANAGER_ADDRESS */
const NFT_POSITION_MANAGER_ADDRESS_BASE = '0x3beEDf6cE77CBdD85f04E1B5Cdd82c04d853b910'
const NFT_POSITION_MANAGER_ADDRESSES = {
  [ChainId.MON_TESTNET]: NFT_POSITION_MANAGER_ADDRESS_BASE,
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x4C3638248749ab3644A63eD0a8c0eE86b2189dC9',
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

const masterChefV3Addresses = {
  [ChainId.MON_TESTNET]: '0x49aE1Bb3C0d9bceE09611282A295aC0180494C04',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

const swapRouterV3Addresses = {
  [ChainId.MON_TESTNET]: '0x737A8fc40BCCa63dAE76BB1f300D31078fe9a79D',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xE18c090D3368dd6A5DF0086D403bFCfc6F3bE2a5',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

export default {
  nftPositionManager: NFT_POSITION_MANAGER_ADDRESSES,
  v3PoolDeployer: DEPLOYER_ADDRESSES,
  poolInitCodeHash: POOL_INIT_CODE_HASHES,
  factory: FACTORY_ADDRESSES,
  masterChefV3: masterChefV3Addresses,
  swapRouterV3: swapRouterV3Addresses
}
