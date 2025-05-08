import type { NativeCurrency } from '@wicchain/swap-sdk-core'
import { ChainId } from '~/types'

export default function useNativeCurrency(chainId: ChainId) {
  const token = computed((): NativeCurrency => {
    try {
      return Native.onChain(chainId ?? ChainId.MON_TESTNET)
    } catch (e) {
      return Native.onChain(ChainId.MON_TESTNET)
    }
  })

  return { token }
}
