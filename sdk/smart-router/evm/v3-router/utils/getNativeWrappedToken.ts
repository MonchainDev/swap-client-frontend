import { Token, WNATIVE } from '@monswap/sdk'
import { ChainId } from '@monswap/chains'

export function getNativeWrappedToken(chainId: ChainId): Token | null {
  return WNATIVE[chainId] ?? null
}
