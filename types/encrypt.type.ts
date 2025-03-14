export enum EncryptRequestType {
  TX_COLLECT = 'transactions/collect'
}
export type EncryptedBody = {
  requestType: string
  content: string
  contentKey: string
}

type TX_Type = 'ADD_POOL' | 'ADD_POSITION' | 'SWAP' | 'INCREASE_LIQUID' | 'REMOVE_LIQUID' | 'STAKE' | 'UNSTAKE' | 'HARVEST'

export interface IBodyTxCollect {
  transactionHash: string
  fromAddress?: string
  toAddress?: string
  fromToken?: string
  toToken?: string
  poolAddress?: string
  network?: string
  tokenId?: number
  amount?: number
  feeAmount?: number
  rewardAmount?: number
  transactionType?: TX_Type
}
