import { ERC20Token } from '@monchain/sdk'
import type { UnsafeCurrency } from '~/types/currency.type'

export const zeroAddress = '0x0000000000000000000000000000000000000000' as const

export default function useCurrency(currencyId: string | undefined, chainId: number): { token: Ref<UnsafeCurrency> } {
  const { listToken } = storeToRefs(useBaseStore())
  const { token: native } = useNativeCurrency(chainId)
  const isNative = computed(() => currencyId?.toUpperCase() === native.value.symbol?.toUpperCase() || currencyId?.toLowerCase() === zeroAddress)

  const token = computed(() => {
    if (isNative.value) {
      return native.value
    }
    const item = listToken?.value?.find((item) => item.address === currencyId || item.symbol === currencyId)
    return item ? new ERC20Token(item.chainId, item.address as `0x${string}`, item.decimals, item.symbol, item.name) : null
  })

  return { token }
}
