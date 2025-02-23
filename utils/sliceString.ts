export default function sliceString(str: string | `0x${string}` | undefined, start = 5, end = 5): string {
  if (!str) return ''
  return str.slice(0, start) + '...' + str.slice(-end)
}
