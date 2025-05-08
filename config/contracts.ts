import { ChainId } from '~/types'

import type { Address, Hash } from 'viem'

/** DEPLOYER_ADDRESSES */
const DEPLOYER_ADDRESSES = {
  [ChainId.MON_TESTNET]: '0x9bc57dd974e8c27ab26165b03dbbcc8c546a18d5',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xd7d6cc0a63a56d8bd50e8ed85fb0195271233c03',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Address>

/** POOL_INIT_CODE_HASH_BASE */
const POOL_INIT_CODE_HASHES = {
  [ChainId.MON_TESTNET]: '0xa415940637fe3d498bed0c48dfd1c0203e8caea5513e272a3749a36063a9582f',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xa415940637fe3d498bed0c48dfd1c0203e8caea5513e272a3749a36063a9582f',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Hash>

/** NFT_POSITION_MANAGER_ADDRESS */
const NFT_POSITION_MANAGER_ADDRESSES = {
  [ChainId.MON_TESTNET]: '0xd10dc97d405828abdb7e107bee83d77be35d5bd7',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xd0b60965701726a3735731ade2aad718ea508619',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Address>

/**
 * To compute Pool address use DEPLOYER_ADDRESSES instead
 */
const FACTORY_ADDRESSES = {
  [ChainId.MON_TESTNET]: '0x040b6a570c67c4927e38390761dc8737980423e1',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xff38e0c492f39a35db89bea881c63a85963de43b',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, Address>

/** MasterChef V3 */
const masterChefV3Addresses = {
  [ChainId.MON_TESTNET]: '0xfa854b6a7ff1ad1bc0e04e88f841abde80876260',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0x2a23389f68d76e85ea86669583433fcc1793d498',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

/** Swap Router V3 */
const swapRouterV3Addresses = {
  [ChainId.MON_TESTNET]: '0x64b6ac9548851b2c7e718fb9fa6c1f5245304872',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xd561850fe9c894b6651bb560302669c5eafa5e59',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

/** LiFi Contract Address */
const lifiContractAddresses = {
  [ChainId.MON_TESTNET]: '0x929ec99b053468ac72bca8b92438a53abf012b2d',
  [ChainId.AMOY_POLYGON]: '0x',
  [ChainId.BSC_TESTNET]: '0xa71adcd37720529957d0f56e0523f177a75ef8be',
  [ChainId.SEPOLIA]: '0x',
  [ChainId.ARBITRUM_SEPOLIA]: '0x'
} as const satisfies Record<ChainId, string>

/** multicall3 */
const multicall3Addresses = {
  [ChainId.MON_TESTNET]: '0xf2f66b104bdd06707103d444af9408b02828f392'
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
