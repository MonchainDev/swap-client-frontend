import { ChainId } from '@monswap/chains'
import { WETH9 } from '@monswap/sdk'
import { BUSD, USDC } from './common'

export const monadTestnetTokens = {
  weth: WETH9[ChainId.MONAD_TESTNET],
  busd: BUSD[ChainId.MONAD_TESTNET],
  usdc: USDC[ChainId.MONAD_TESTNET],
}
