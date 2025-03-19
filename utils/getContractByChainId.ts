import type { Address } from 'viem'
import { ChainId } from '~/types'
import addresses from '~/config/contracts'

export type Addresses = {
  [chainId in ChainId]?: Address
}

export const getAddressFromMap = (address: Addresses, chainId?: number): `0x${string}` => {
  return chainId && address[chainId as ChainId] ? (address[chainId as ChainId] as `0x${string}`) : (address[ChainId.MON_TESTNET] as `0x${string}`)
}

export const getAddressFromMapNoFallback = (address: Addresses, chainId?: number): `0x${string}` | null => {
  return chainId ? (address[chainId as ChainId] ?? null) : null
}

export const getMasterChefV3Address = (chainId?: number) => {
  return getAddressFromMap(addresses.masterChefV3, chainId)
}

export const getSwapRouterV3Address = (chainId?: number) => {
  return getAddressFromMap(addresses.swapRouterV3, chainId)
}

export const getFactoryAddress = (chainId?: number) => {
  return getAddressFromMapNoFallback(addresses.factory, chainId)
}

export const getNftPositionManagerAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.nftPositionManager, chainId)
}

export const getV3PoolDeployerAddress = (chainId?: number) => {
  return getAddressFromMapNoFallback(addresses.v3PoolDeployer, chainId)
}

export const getPoolInitCodeHash = (chainId?: number) => {
  return getAddressFromMapNoFallback(addresses.poolInitCodeHash, chainId)
}

export const getSpenderCreatePool = (chainId?: number) => {
  return getAddressFromMapNoFallback(addresses.nftPositionManager, chainId)
}
