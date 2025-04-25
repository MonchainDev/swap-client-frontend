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
  currentPrice: number
  chainId: number
  baseDerivedUsd: number
  quoteDerivedUsd: number
  quoteLogo: string
  baseLogo: string
  lastTvl: number
}

export interface IPoolOrigin {
  tokenbase: string
  currenttick: number
  rewardapr: number
  ticklower: number
  liquidity: number
  basesymbol: string
  tokenquote: string
  feeapr: number
  priceupper: number
  quotedecimals: number
  poolstatus: string
  fee: number
  basedecimals: number
  pricelower: number
  network: string
  pooladdress: string
  createdby: string
  baseqtty: number
  tvl: number
  volume24h: number
  tickupper: number
  tokenid: number
  createdat: number
  quoteqtty: number
  quotesymbol: string
}

export interface IPoolTvl {
  id: number
  calcDate: number
  poolAddress: string
  network: string
  chainId: number
  tvlUsd: number
  volume24h: number
  tick: number
  liquidity: number
}
