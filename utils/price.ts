/** Q96 = 2^96 */
const Q96 = BigInt(2 ** 96)

/**
 * Chuyển đổi sqrtPriceX96 thành giá của Token1 so với Token0.
 * @param sqrtPriceX96 Giá trị sqrtPriceX96 từ pool.
 * @returns Giá trị của Token1/Token0 dưới dạng số thực.
 */
export function sqrtPriceX96ToPriceToken1Per0(sqrtPriceX96: bigint): number {
  const sqrtPrice = sqrtPriceX96 / Q96 // sqrtPrice = sqrtPriceX96 / Q96
  return Number(sqrtPrice) ** 2 // price = sqrtPrice^2
}

/**
 * Chuyển đổi sqrtPriceX96 thành giá của Token0 so với Token1.
 * @param sqrtPriceX96 Giá trị sqrtPriceX96 từ pool.
 * @returns Giá trị của Token0/Token1 dưới dạng số thực.
 */
export function sqrtPriceX96ToPriceToken0Per1(sqrtPriceX96: bigint): number {
  const price = sqrtPriceX96ToPriceToken1Per0(sqrtPriceX96)
  return 1 / price
}
