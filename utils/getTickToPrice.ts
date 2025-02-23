import type { Price, Token } from '@pancakeswap/swap-sdk-core'
import { tickToPrice } from '@pancakeswap/v3-sdk'

export function getTickToPrice(baseToken?: Token, quoteToken?: Token, tick?: number): Price<Token, Token> | undefined {
  console.log('🚀 ~ getTickToPrice ~ getTickToPrice:', baseToken, quoteToken, tick)
  if (!baseToken || !quoteToken || typeof tick !== 'number') {
    return undefined
  }
  return tickToPrice(baseToken, quoteToken, tick)
}
