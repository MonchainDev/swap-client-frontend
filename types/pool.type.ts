export interface IPool {
  poolAddress: string
  tokenBase: string
  tokenQuote: string
  baseSymbol: string
  quoteSymbol: string
  fee: number
  network: string
  tickLower: number
  priceLower: number
  tickUpper: number
  priceUpper: number
  tokenId: string
  baseDecimals: number
  quoteDecimals: number
  poolStatus: string
  createdBy: string
  currentTick: number
  baseQtty: number
  quoteQtty: number
  tvl: number
  volume24h: number
  feeApr: number
  rewardApr: number
  liquidity: number
}
