import { Price, type Token } from '@monswap/swap-sdk-core'

export function tryParsePrice(baseToken?: Token, quoteToken?: Token, value?: string) {
  if (!baseToken || !quoteToken || !value) {
    return undefined
  }

  if (!value.match(/^\d*\.?\d+$/)) {
    return undefined
  }

  const [whole, fraction] = value.split('.')

  const decimals = fraction?.length ?? 0
  const withoutDecimals = BigInt((whole ?? '') + (fraction ?? ''))

  return new Price(baseToken, quoteToken, BigInt(10 ** decimals) * BigInt(10 ** baseToken.decimals), withoutDecimals * BigInt(10 ** quoteToken.decimals))
}
