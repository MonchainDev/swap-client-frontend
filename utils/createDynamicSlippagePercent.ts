import { Percent } from '@monchain/swap-sdk-core'

function createDynamicSlippagePercent(slippageInput: number): Percent {
  if (isNaN(slippageInput) || slippageInput < 0) {
    throw new Error('Invalid slippage value')
  }

  const slippageStr = slippageInput.toString()
  const decimalPart = slippageStr.split('.')[1] || ''
  const decimalPlaces = decimalPart.length
  const denominator = Math.pow(10, decimalPlaces + 2)
  const numerator = Math.round(slippageInput * denominator)

  return new Percent(numerator, denominator)
}

export default createDynamicSlippagePercent
