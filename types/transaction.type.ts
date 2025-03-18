export interface ITransaction {
  id: string
  transactionHash: string
  fromAddress: string
  toAddress: string
  fromToken: string
  toToken: string
  poolAddress: string
  network: string
  tokenId: number
  amount: number
  feeAmount: number
  rewardAmount: number
  transactionType: string
  createdAt: number
}
