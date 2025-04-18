import type { Price, Token } from '@monchain/sdk'
import type { Position } from '@monchain/v3-sdk'
import { tickToPrice } from '@monchain/v3-sdk'

export default function getPriceOrderingFromPositionForUI(position?: Position): {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
} {
  if (!position) {
    return {}
  }

  const token0 = position.amount0.currency
  const token1 = position.amount1.currency

  // if both prices are below 1, invert
  if (position.token0PriceUpper.lessThan(1)) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1
    }
  }

  // otherwise, just return the default
  return {
    priceLower: tickToPrice(position.pool.token0, position.pool.token1, position.tickLower),
    priceUpper: tickToPrice(position.pool.token0, position.pool.token1, position.tickUpper),
    quote: token1,
    base: token0
  }
}
