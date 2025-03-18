import type { IToken } from '~/types/index'

export type TYPE_SWAP = 'BASE' | 'QUOTE'

export type ReturnTypeGetBalance = {
  decimals: number
  formatted: string
  symbol: string
  value: bigint
}

export interface IFormSwap {
  token0: IToken
  token1: IToken
  amountIn: string
  amountOut: string
  chainId?: number
  minimumAmountOut?: string
  maximumAmountIn?: string
  priceImpact: string
  fee: number
  tradingFee: number | bigint
}
