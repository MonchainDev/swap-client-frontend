export function formatAddress(value: string | null, start = 5, end = 5, mask = '...'): string {
  if (!value) return ''
  return value.length <= start + end ? value : `${value.slice(0, start)}${mask}${value.slice(value.length - end)}`
}
