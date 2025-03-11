import type { IToken } from '~/types/index'

export type TYPE_BRIDGE = 'BASE' | 'QUOTE' | 'SEND'

export type ReturnTypeGetBalance = {
  decimals: number
  formatted: string
  symbol: string
  value: bigint
}

export interface IFormBridge {
  token: IToken
  amount: string
  chainId?: number
  priceImpact: string
  fee: number
  tradingFee: number
}
