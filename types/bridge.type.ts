import type { IToken } from '~/types/index'

export type TYPE_BRIDGE = 'BASE' | 'QUOTE' | 'SEND'

export type ReturnTypeGetBalance = {
  decimals: number
  formatted: string
  symbol: string
  value: bigint
}

export interface IFormBridge {
  // token0: IToken
  // token1: IToken
  token2: IToken
  amount: string
  chainId?: number
  minimumAmountOut?: string
  maximumAmountIn?: string
  priceImpact: string
  fee: number
  tradingFee: number
}
