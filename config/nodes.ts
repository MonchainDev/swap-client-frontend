import { ChainId } from '~/types'

export const PUBLIC_NODES: Record<ChainId, string[] | readonly string[]> = {
  [ChainId.MON_TESTNET]: ['https://rpc-testnet.monchain.info'],
  [ChainId.BSC_TESTNET]: []
}
