import Decimal from 'decimal.js'

export default function toSignificant(value: string | number, significantDigits = 6): string {
  if (!value) return '0'

  if (+value > 0 && +value < 0.000001) return '<0.000001'

  Decimal.set({ precision: significantDigits + 1, rounding: Decimal.ROUND_HALF_UP })
  const quotient = new Decimal(value).toSignificantDigits(significantDigits).toString()
  return quotient
}
