export default function sliceString(str: string, start = 5, end = 5): string {
  console.log('🚀 ~ sliceString ~ str:', str)
  if (!str) return ''
  return str.slice(0, start) + '...' + str.slice(-end)
}
