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
}

export enum ChainId {
  BSC_TESTNET = 97,
  MON_TESTNET = 16789
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
