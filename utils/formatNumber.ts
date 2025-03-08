export default function formatNumber(value: string | number): string {
  if (!value) return value.toString()
  const parts = value.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}
