import type { Currency, Token } from '@monswap/swap-sdk-core'
import { NativeCurrency } from '@monswap/swap-sdk-core'
import type { ERC20Token } from '@monswap/swap-sdk-evm'
import { NATIVE, WMON } from '~/constant/token'
import { ChainId } from '~/types'

export const WNATIVE = {
  [ChainId.BSC_TESTNET]: WMON[ChainId.BSC_TESTNET],
  [ChainId.MON_TESTNET]: WMON[ChainId.MON_TESTNET]
} as Record<ChainId, ERC20Token>

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
    const { decimals, name, symbol } = NATIVE[chainId as keyof typeof WNATIVE]

    return (this.cache[chainId] = new Native({ chainId, decimals, symbol, name }))
  }

  public equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }
}
