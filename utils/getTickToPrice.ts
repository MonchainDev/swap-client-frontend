import type { Price, Token } from '@wicchain/swap-sdk-core'
import { tickToPrice } from '@wicchain/v3-sdk'

export function getTickToPrice(baseToken?: Token, quoteToken?: Token, tick?: number): Price<Token, Token> | undefined {
  // console.log('🚀 ~ getTickToPrice ~ quoteToken:', quoteToken)
  // console.log('🚀 ~ getTickToPrice ~ baseToken:', baseToken)
  if (!baseToken || !quoteToken || typeof tick !== 'number') {
    return undefined
  }
  return tickToPrice(baseToken, quoteToken, tick)
}
