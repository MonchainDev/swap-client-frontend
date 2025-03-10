export default function formatNumberInput(value: string, removeDot = false) {
  if (!value) return ''
  if (value === '∞') {
    return value
  }

  let text = ''
  if (removeDot) {
    text = value.replace(/[^\d]/g, '')
    return text
  } else {
    text = value.replace(/[^\d.]/g, '')
    return text
  }
}
