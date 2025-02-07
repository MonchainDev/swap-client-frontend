export type TYPE_SWAP = 'BASE' | 'QUOTE'

export type ReturnTypeGetBalance = {
  decimals: number
  formatted: string
  symbol: string
  value: bigint
}
