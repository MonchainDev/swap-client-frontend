///Tính sqrtPriceX96
export const calcSqrtPriceX96 = (price: number, token0Decimals: number, token1Decimals: number) => {
  const decimalAdjustment = 10 ** (token0Decimals - token1Decimals)
  const mathPrice = price / decimalAdjustment

  const sqrtPriceX96 = Math.floor(Math.sqrt(mathPrice) * 2 ** 96)
  return BigInt(sqrtPriceX96)
}
