import type { Address } from 'viem'

export interface IToken {
  circulating_market_cap?: string
  icon_url: string
  name: string
  decimals: string | number
  symbol: string
  address: string
  type?: string
  holders?: string
  exchange_rate?: string
  total_supply?: string
}

export interface INetwork {
  title: string
  logo: string
  value: string
  chainId: ChainId
  disabled?: boolean
}

export enum ChainId {
  BSC_TESTNET = 97,
  MON_TESTNET = 16789,
  SEPOLIA = 11155111,
  POLYGON = 137,
  LINEA = 80001
}

export enum CurrencyField {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B'
}
export interface ZoomLevels {
  initialMin: number
  initialMax: number
  min: number
  max: number
}

export enum Bound {
  LOWER = 'LOWER',
  UPPER = 'UPPER'
}

export const BIG_INT_ZERO = 0n
export const BIG_INT_TEN = 10n

export type TYPE_STATUS = 'SUCCESS' | 'FAILED'

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID
}

export type PositionDetail = {
  // detail read from contract
  nonce: bigint
  tokenId: bigint
  operator: string
  token0: Address
  token1: Address
  fee: number
  tickLower: number
  tickUpper: number
  liquidity: bigint
  feeGrowthInside0LastX128: bigint
  feeGrowthInside1LastX128: bigint
  tokensOwed0: bigint
  tokensOwed1: bigint

  // additional detail
  isStaked?: boolean
  chainId: number
  protocol: 'v3'

  farmingMultiplier: number
  farmingLiquidity: bigint
}

export interface IExchangeRate {
  id: string
  tokenId: number
  name: string
  symbol: string
  slug: string
  inPage: number
  createdAt: number
  updatedAt: number
  exchangeRate: number
  priceUsd: number
  lastUpdatedRate: number
}
