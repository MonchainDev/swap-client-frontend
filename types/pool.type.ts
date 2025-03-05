export interface IPool {
  id: string
  poolAddress: string
  tokenBase: string
  baseSymbol: string
  tokenQuote: string
  quoteSymbol: string
  baseDecimals: number
  quoteDecimals: number
  network: string
  liquidity: number
  fee: number
  tickLower: number
  priceLower: number
  tickUpper: number
  priceUpper: number
  tokenId: number
  feeGrowthInside0LastX128: number
  feeGrowthInside1LastX128: number
  poolStatus: string
  createdBy: string
  createdAt: number
  updatedAt: number
  inChange: string
}
