import invariant from 'tiny-invariant'
import type { Currency, Token } from '@wicchain/swap-sdk-core'
import { NativeCurrency } from '@wicchain/swap-sdk-core'
import { NATIVE, WNATIVE } from '~/config/tokens'

export class Native extends NativeCurrency {
  protected constructor({ chainId, decimals, name, symbol }: { chainId: number; decimals: number; symbol: string; name: string }) {
    super(chainId, decimals, symbol, name)
  }

  public get wrapped(): Token {
    const wnative = WNATIVE[this.chainId as keyof typeof WNATIVE]
    return wnative
  }

  private static cache: { [chainId: number]: Native } = {}

  public static onChain(chainId: number): Native {
    if (chainId in this.cache) {
      return this.cache[chainId]
    }
    invariant(!!NATIVE[chainId as keyof typeof NATIVE], 'NATIVE_CURRENCY')
    const { decimals, name, symbol } = NATIVE[chainId as keyof typeof NATIVE]

    return (this.cache[chainId] = new Native({ chainId, decimals, symbol, name }))
  }

  public equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }
}
