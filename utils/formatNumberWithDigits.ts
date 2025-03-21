export default function formatNumberWithDigits(value: string | number, digits = 2): string {
  if (!value) return ''
  const numberConvert = Number(value).toFixed(digits)
  if (parseFloat(numberConvert) === 0) return '0'
  return formatNumber(numberConvert)
}
