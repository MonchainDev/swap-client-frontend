export default function usePoolActiveLiquidity() {
  const { feeAmount } = storeToRefs(useLiquidityStore())
  const { pool } = usePools()

  // Find nearest valid tick for pool in case tick is not initialized.
  const activeTick = computed(() => {
    if (feeAmount.value && pool.value?.tickCurrent) {
      return getActiveTick(pool.value.tickCurrent, feeAmount.value)
    }
  })

  return { pool, activeTick }
}
