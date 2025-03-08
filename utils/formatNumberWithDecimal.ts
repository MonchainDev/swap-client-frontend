import Decimal from 'decimal.js'

export default function formatNumberWithDecimal(value: string | number, decimal = 2): string {
  if (!value) return ''
  const wei = new Decimal(10).pow(decimal)
  const numberConvert = new Decimal(value).div(wei).toSignificantDigits(6).toString()
  return formatNumber(numberConvert)
}
