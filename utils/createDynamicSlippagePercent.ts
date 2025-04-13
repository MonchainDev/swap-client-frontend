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

/**
 * Convert giá trị slippage từ int / float sang Percent
 * @param slippagePercentage  // 0.1, 0.5 , 1, 2...
 * @returns Percent
 */
function convertSlippageToPercent(slippagePercentage: string | number): Percent {
  const slippageValue = typeof slippagePercentage === 'string' ? parseFloat(slippagePercentage) : slippagePercentage

  if (isNaN(slippageValue) || slippageValue < 0) {
    throw new Error('Invalid slippage value')
  }

  if (slippageValue === 0) {
    return new Percent(0, 1)
  }

  const slippageDecimal = slippageValue / 100

  const precision = 10000
  const numerator = Math.round(slippageDecimal * precision)
  const denominator = precision

  const gcd = findGCD(numerator, denominator)

  return new Percent(numerator / gcd, denominator / gcd)
}

function findGCD(a: number, b: number): number {
  return b === 0 ? a : findGCD(b, a % b)
}

export { createDynamicSlippagePercent, convertSlippageToPercent }
