const formatNumberAbbreviation = (value: number) => {
  if (!value) return '0'

  const number = Number(value)
  const SI_SYMBOL = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y', 'R', 'W']

  // Tìm chỉ số của 1000 gần nhất
  const tier = (Math.log10(Math.abs(number)) / 3) | 0

  // Nếu không có chỉ số nào, trả về chuỗi ban đầu
  if (tier === 0) return value

  // Tính giá trị đại diện của số
  const suffix = SI_SYMBOL[tier] ?? ''

  // Chuyển đổi số về dạng số nguyên để loại bỏ số thập phân
  const scale = Math.pow(10, tier * 3)
  const scaledNumber = number / scale

  // Định dạng số với một chữ số thập phân
  const formattedNumber = scaledNumber.toFixed(2)

  // Trả về chuỗi đã chuyển đổi
  return formattedNumber + suffix
}

export default formatNumberAbbreviation
