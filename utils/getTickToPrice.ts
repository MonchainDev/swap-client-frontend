import type { Price, Token } from 'monswap-client/packages/swap-sdk-core/src'
import { tickToPrice } from 'monswap-client/packages/v3-sdk/src'

export function getTickToPrice(baseToken?: Token, quoteToken?: Token, tick?: number): Price<Token, Token> | undefined {
  if (!baseToken || !quoteToken || typeof tick !== 'number') {
    return undefined
  }
  return tickToPrice(baseToken, quoteToken, tick)
}
