import { CurrencyAmount, Fraction, TradeType, type Currency, type Percent } from '@monchain/swap-sdk-core'
import invariant from 'tiny-invariant'

const ONE = 1n

function maximumAmountIn(slippageTolerance: Percent, amountIn: CurrencyAmount<Currency>, tradeType: TradeType): CurrencyAmount<Currency> {
  invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
  if (tradeType === TradeType.EXACT_INPUT) {
    return amountIn
  }
  const slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(amountIn.quotient).quotient
  return CurrencyAmount.fromRawAmount(amountIn.currency, slippageAdjustedAmountIn)
}

function minimumAmountOut(slippageTolerance: Percent, amountOut: CurrencyAmount<Currency>, tradeType: TradeType): CurrencyAmount<Currency> {
  invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
  if (tradeType === TradeType.EXACT_OUTPUT) {
    return amountOut
  }
  const slippageAdjustedAmountOut = new Fraction(ONE).add(slippageTolerance).invert().multiply(amountOut.quotient).quotient
  return CurrencyAmount.fromRawAmount(amountOut.currency, slippageAdjustedAmountOut)
}

export { maximumAmountIn, minimumAmountOut }
