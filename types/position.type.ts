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
  feeapr: number
  rewardapr: number
  basedecimals: number
  quotesymbol: string
  tokenid: number
  ticklower: number
  createdby: string
  pricelower: number
  pooladdress: string
  quoteqtty: number
  baseqtty: number
  pooltype: null | 'FARM'
  positionstatus: string
  pendingreward: number
}

export interface IPosition {
  quoteDecimals: number
  tokenQuote: string
  quoteQuantity: number
  baseSymbol: string
  network: string
  tokenBase: string
  baseQuantity: number
  createdAt: number
  priceUpper: number
  fee: number
  feeApr: number
  rewardApr: number
  tickUpper: number
  updatedAt: number
  baseDecimals: number
  quoteSymbol: string
  tokenId: number
  tickLower: number
  createdBy: string
  priceLower: number
  poolAddress: string
  poolType: null | 'FARM'
  positionStatus: string
  priceUdtTotal?: string
  pendingReward: number
  liquidity: number
}
