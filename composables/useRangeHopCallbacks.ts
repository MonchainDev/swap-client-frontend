import { nearestUsableTick, TICK_SPACINGS, tickToPrice } from 'monswap-client/packages/v3-sdk/src'

export default function useRangeHopCallbacks() {
  const { tickLower, tickUpper } = useV3DerivedInfo()
  const { baseCurrency, quoteCurrency, feeAmount } = storeToRefs(useLiquidityStore())

  const baseToken = computed(() => baseCurrency.value?.wrapped)
  const quoteToken = computed(() => quoteCurrency.value?.wrapped)

  const getDecrementLower = () => {
    if (baseToken.value && quoteToken.value && typeof tickLower.value === 'number' && feeAmount.value) {
      return tickToPrice(
        baseToken.value,
        quoteToken.value,
        nearestUsableTick(
          tickLower.value - TICK_SPACINGS[feeAmount.value as keyof typeof TICK_SPACINGS],
          TICK_SPACINGS[feeAmount.value as keyof typeof TICK_SPACINGS]
        )
      )
    }
    // use pool current tick as starting tick if we have pool but no tick input
    // if (!(typeof tickLower.value === 'number') && baseToken.value && quoteToken.value && feeAmount.value && pool) {
    //   return tickToPrice(baseToken.value, quoteToken.value, nearestUsableTick(pool.tickCurrent - TICK_SPACINGS[feeAmount], TICK_SPACINGS[feeAmount]))
    // }
    return undefined
  }

  const getIncrementLower = () => {
    console.log('🚀 ~ getIncrementLower ~ getIncrementLower:')
    if (baseToken.value && quoteToken.value && typeof tickLower.value === 'number' && feeAmount.value) {
      return tickToPrice(
        baseToken.value,
        quoteToken.value,
        nearestUsableTick(
          tickLower.value + TICK_SPACINGS[feeAmount.value as keyof typeof TICK_SPACINGS],
          TICK_SPACINGS[feeAmount.value as keyof typeof TICK_SPACINGS]
        )
      )
    }
    // use pool current tick as starting tick if we have pool but no tick input
    // if (!(typeof tickLower === 'number') && baseToken && quoteToken && feeAmount && pool) {
    //   return tickToPrice(baseToken, quoteToken, nearestUsableTick(pool.tickCurrent + TICK_SPACINGS[feeAmount], TICK_SPACINGS[feeAmount]))
    // }
    return undefined
  }

  const getDecrementUpper = () => {
    if (baseToken.value && quoteToken.value && typeof tickUpper.value === 'number' && feeAmount.value) {
      return tickToPrice(
        baseToken.value,
        quoteToken.value,
        nearestUsableTick(
          tickUpper.value - TICK_SPACINGS[feeAmount.value as keyof typeof TICK_SPACINGS],
          TICK_SPACINGS[feeAmount.value as keyof typeof TICK_SPACINGS]
        )
      )
    }
    // use pool current tick as starting tick if we have pool but no tick input
    // if (!(typeof tickUpper === 'number') && baseToken && quoteToken && feeAmount && pool) {
    //   return tickToPrice(baseToken, quoteToken, nearestUsableTick(pool.tickCurrent - TICK_SPACINGS[feeAmount], TICK_SPACINGS[feeAmount]))
    // }
    return undefined
  }

  const getIncrementUpper = () => {
    if (baseToken.value && quoteToken.value && typeof tickUpper.value === 'number' && feeAmount.value) {
      return tickToPrice(
        baseToken.value,
        quoteToken.value,
        nearestUsableTick(
          tickUpper.value + TICK_SPACINGS[feeAmount.value as keyof typeof TICK_SPACINGS],
          TICK_SPACINGS[feeAmount.value as keyof typeof TICK_SPACINGS]
        )
      )
    }
    // use pool current tick as starting tick if we have pool but no tick input
    // if (!(typeof tickUpper === 'number') && baseToken && quoteToken && feeAmount && pool) {
    //   return tickToPrice(baseToken, quoteToken, nearestUsableTick(pool.tickCurrent + TICK_SPACINGS[feeAmount], TICK_SPACINGS[feeAmount]))
    // }
    return undefined
  }

  return { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper }
}
