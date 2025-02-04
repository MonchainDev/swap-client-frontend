export interface IToken {
  circulating_market_cap?: string
  icon_url: string
  name: string
  decimals: string | number
  symbol: string
  address: string
  type?: string
  holders?: string
  exchange_rate?: string
  total_supply?: string
}

export interface INetwork {
  title: string
  logo: string
  value: string
}
