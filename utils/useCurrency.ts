import type { Currency, NativeCurrency } from '@pancakeswap/swap-sdk-core'
import type { ERC20Token } from '@pancakeswap/swap-sdk-evm'
import { ChainId } from '@pancakeswap/chains'

export type UnsafeCurrency = Currency | ERC20Token | null | undefined

export function useCurrency(currencyId: string | undefined): UnsafeCurrency {
  const native: NativeCurrency = useNativeCurrency()
  const isNative =
    currencyId?.toUpperCase() === native.symbol?.toUpperCase() || currencyId?.toLowerCase() === GELATO_NATIVE || currencyId?.toLowerCase() === zeroAddress

  const token = useToken(isNative ? undefined : currencyId)
  return isNative ? native : token
}

export default function useNativeCurrency(overrideChainId?: ChainId): NativeCurrency {
  // const { chainId } = useActiveChainId()
  return useMemo(() => {
    try {
      return Native.onChain(overrideChainId ?? chainId ?? ChainId.BSC)
    } catch (e) {
      return Native.onChain(ChainId.BSC)
    }
  }, [overrideChainId, chainId])
}
