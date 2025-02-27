import { ChainId } from '@monswap/chains'
import { WETH9 } from '@monswap/sdk'
import { USDC } from './common'

export const monTestnetTokens = {
  weth: WETH9[ChainId.MON_TESTNET],
  usdc: USDC[ChainId.MON_TESTNET]
}
