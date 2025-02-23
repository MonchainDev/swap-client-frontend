///Tính sqrtPriceX96
export const calcSqrtPriceX96 = (price: number) => {
  const sqrtPrice = Math.sqrt(price)
  const shift = BigInt(2) ** BigInt(96)
  const sqrtPriceX96 = BigInt(Math.round(sqrtPrice * Number(shift)))
  return sqrtPriceX96
}
