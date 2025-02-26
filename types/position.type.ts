import type { IToken } from '.'

export interface IFormCreatePosition {
  token0: IToken
  token1: IToken
  minPrice: string | undefined
  maxPrice: string | undefined
  amount: string
  amountDeposit0: string
  amountDeposit1: string
}

export type RANGE = 'FULL' | 'CUSTOM'
