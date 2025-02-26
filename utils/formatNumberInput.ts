export default function formatNumberInput(value: string, _isSplit = true) {
  if (!value) return ''
  if (value === '∞') {
    return value
  }

  let text = ''
  //   const flag = false
  text = value.replace(/[^\d.]/g, '')

  //   if (isSplit) {
  //     const arrText: string[] = []

  //     for (let index = 0; index < text.length; index++) {
  //       if (flag) {
  //         if (text[index] !== '.' && text[index] !== '-') {
  //           arrText.push(text[index])
  //         }
  //       } else {
  //         if (text[index] === '.') {
  //           flag = true
  //         }
  //         arrText.push(text[index])
  //       }
  //     }
  //     text = arrText.join('')

  //     if (text.includes('.')) {
  //       const naturalPart = text.toString().split('.')
  //       naturalPart[0] = naturalPart[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  //       return naturalPart.join('.')
  //     } else {
  //       return text === '-' ? '-' : formatNumber(+text)
  //     }
  //   }
  return text
}
