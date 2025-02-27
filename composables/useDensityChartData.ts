// import usePoolActiveLiquidity from './usePoolActiveLiquidity'
import usePools from './usePools'

export default function useDensityChartData() {
  // const { feeAmount, baseCurrency, quoteCurrency } = storeToRefs(useLiquidityStore())

  // const { data } = usePoolActiveLiquidity()

  const { poolAddresses } = usePools()

  return { poolAddresses }
}
