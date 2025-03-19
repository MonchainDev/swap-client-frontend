// import type { IToken } from '~/types/index'

export type ReturnTypeGetBalance = {
  decimals: number
  formatted: string
  symbol: string
  value: bigint
}

export interface IFormBridge {
  token: TokenConfig
  amount: string
  chainId?: number
  priceImpact: string
  fee: number
  tradingFee: number
}

export interface NetworkConfig {
  id: number;
  network: string;
  chainId: number;
  rpc: string;
  graphUrl: string;
  nativeToken: string;
  wrapToken: string;
  wrapTokenAddress: string;
}

export interface TokenConfig {
  id: number;
  tokenSymbol: string;
  tokenAddress: string;
  tokenDecimals: number;
  network: string;
  chainId: number;
  stable: boolean;
  crossChain: boolean;
}