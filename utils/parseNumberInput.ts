export default function parseNumberInput(value: string) {
  if (!value) return ''
  value = value.replace(/[^\d.-]/g, '')
  return value.replace(/\$\s?|(,*)/g, '')
}
