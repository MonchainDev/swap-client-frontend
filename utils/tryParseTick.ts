import type { Price, Token } from '@pancakeswap/swap-sdk-core'
import { encodeSqrtRatioX96, nearestUsableTick, priceToClosestTick, TICK_SPACINGS, TickMath, type FeeAmount } from '@pancakeswap/v3-sdk'

export default function tryParseTick(feeAmount?: FeeAmount, price?: Price<Token, Token> | undefined | boolean): number | undefined {
  if (!price || !feeAmount || typeof price === 'boolean') {
    return undefined
  }

  let tick: number

  // check price is within min/max bounds, if outside return min/max
  const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator)

  if (sqrtRatioX96 >= TickMath.MAX_SQRT_RATIO) {
    tick = TickMath.MAX_TICK
  } else if (sqrtRatioX96 <= TickMath.MIN_SQRT_RATIO) {
    tick = TickMath.MIN_TICK
  } else {
    // this function is agnostic to the base, will always return the correct tick
    tick = priceToClosestTick(price)
  }

  return nearestUsableTick(tick, TICK_SPACINGS[feeAmount])
}
