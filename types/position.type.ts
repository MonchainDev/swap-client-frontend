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

export interface IPositionOrigin {
  quotedecimals: number
  tokenquote: string
  basesymbol: string
  network: string
  tokenbase: string
  createdat: number
  priceupper: number
  fee: number
  tickupper: number
  updatedat: number
  basedecimals: number
  quotesymbol: string
  tokenid: number
  ticklower: number
  createdby: string
  pricelower: number
  pooladdress: string
}

export interface IPosition {
  quoteDecimals: number
  tokenQuote: string
  baseSymbol: string
  network: string
  tokenBase: string
  createdAt: number
  priceUpper: number
  fee: number
  tickUpper: number
  updatedAt: number
  baseDecimals: number
  quoteSymbol: string
  tokenId: number
  tickLower: number
  createdBy: string
  priceLower: number
  poolAddress: string
}
