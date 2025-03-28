import ABI_MON_FACTORY from '@/constant/abi/MonFactory.json'
import { useReadContract } from '@wagmi/vue'
import { FeeAmount } from '~/constant/fee'

export default function useFetchPool() {
  const { baseCurrency, quoteCurrency, feeAmount } = storeToRefs(useLiquidityStore())
  const { chainId } = useActiveChainId()

  const listFee = [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH]

  const indexFee = computed(() => listFee.indexOf(feeAmount.value))

  const factoryAddress = computed(() => getFactoryAddress(chainId.value) ?? '0x')

  const { data: poolAddressLowest, isPending: isPendingLowest } = useReadContract(
    computed(() => ({
      abi: ABI_MON_FACTORY,
      address: factoryAddress.value,
      functionName: 'getPool',
      args: [baseCurrency.value?.wrapped.address, quoteCurrency.value?.wrapped.address, FeeAmount.LOWEST],
      watch: true,
      chainId: chainId.value
    }))
  )

  const { data: poolAddressLow, isPending: isPendingLow } = useReadContract(
    computed(() => ({
      abi: ABI_MON_FACTORY,
      address: factoryAddress.value,
      functionName: 'getPool',
      args: [baseCurrency.value?.wrapped.address, quoteCurrency.value?.wrapped.address, FeeAmount.LOW],
      chainId: chainId.value
    }))
  )

  const { data: poolAddressMedium, isPending: isPendingMedium } = useReadContract(
    computed(() => ({
      abi: ABI_MON_FACTORY,
      address: factoryAddress.value,
      functionName: 'getPool',
      args: [baseCurrency.value?.wrapped.address, quoteCurrency.value?.wrapped.address, FeeAmount.MEDIUM],
      chainId: chainId.value
    }))
  )

  const { data: poolAddressHigh, isPending: isPendingHigh } = useReadContract(
    computed(() => ({
      abi: ABI_MON_FACTORY,
      address: factoryAddress.value,
      functionName: 'getPool',
      args: [baseCurrency.value?.wrapped.address, quoteCurrency.value?.wrapped.address, FeeAmount.HIGH],
      chainId: chainId.value
    }))
  )

  const listPoolExits = computed(() => {
    const invalidAddress = '0x0000000000000000000000000000000000000000'
    if (baseCurrency.value && quoteCurrency.value && !isPendingLowest.value && !isPendingLow.value && !isPendingMedium.value && !isPendingHigh.value) {
      return [poolAddressLowest.value, poolAddressLow.value, poolAddressMedium.value, poolAddressHigh.value].map(
        (poolAddress) => poolAddress !== invalidAddress
      )
    }
    return [false, false, false, false]
  })

  const poolExits = computed(() => listPoolExits.value[indexFee.value])

  const isPendingAll = computed(() => isPendingLowest.value && isPendingLow.value && isPendingMedium.value && isPendingHigh.value)

  return { poolExits, listPoolExits, isPendingAll }
}
