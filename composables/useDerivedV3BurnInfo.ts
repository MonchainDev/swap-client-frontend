import { CurrencyAmount, Percent, type Token } from '@pancakeswap/swap-sdk-core'
import type { Pool } from '@pancakeswap/v3-sdk'
import { Position } from '@pancakeswap/v3-sdk'
import { useAccount } from '@wagmi/vue'
import type { PositionDetail } from '~/types'

export default function useDerivedV3BurnInfo(position: Ref<PositionDetail | undefined>, percent: Ref<string>, asWNATIVE: Ref<boolean>) {
  const { address: account, chainId } = useAccount()

  const { form, feeAmount } = storeToRefs(useLiquidityStore())

  const token0 = ref<Token>()
  const token1 = ref<Token>()

  watchEffect(async () => {
    if (position.value) {
      token0.value = await getTokenByChainId(position.value.token0 as string, chainId.value!)
      token1.value = await getTokenByChainId(position.value.token1 as string, chainId.value!)
      form.value.token0 = { ...token0.value, icon_url: '', name: token0.value?.name || '' }
      form.value.token1 = { ...token1.value, icon_url: '', name: token1.value?.name || '' }
      feeAmount.value = position.value.fee ?? 0
    }
  })

  const liquidityPercentage = computed(() => {
    return percent.value === null || percent.value === undefined ? undefined : new Percent(percent.value, 100)
  })
  const { pool } = usePools()

  const positionSDK = computed(() =>
    position.value &&
    pool.value &&
    typeof position?.value?.liquidity === 'bigint' &&
    typeof position.value?.tickLower === 'number' &&
    typeof position.value?.tickUpper === 'number'
      ? new Position({
          pool: pool.value as Pool,
          liquidity: position.value.liquidity.toString(),
          tickLower: position.value.tickLower,
          tickUpper: position.value.tickUpper
        })
      : undefined
  )

  const discountedAmount0 = computed(() => {
    return positionSDK.value ? liquidityPercentage.value?.multiply(positionSDK.value.amount0.quotient).quotient : undefined
  })
  const discountedAmount1 = computed(() => {
    return positionSDK.value ? liquidityPercentage.value?.multiply(positionSDK.value.amount1.quotient).quotient : undefined
  })

  const unwrappedToken0 = computed(() => (token0.value ? unwrappedToken(token0.value) : undefined))
  const unwrappedToken1 = computed(() => (token1.value ? unwrappedToken(token1.value) : undefined))

  const liquidityValue0 = computed(() => {
    return token0.value && unwrappedToken0.value && typeof discountedAmount0.value !== 'undefined'
      ? CurrencyAmount.fromRawAmount(asWNATIVE.value ? token0.value : unwrappedToken0.value, discountedAmount0.value)
      : undefined
  })
  const liquidityValue1 = computed(() => {
    return token1.value && unwrappedToken1.value && typeof discountedAmount1.value !== 'undefined'
      ? CurrencyAmount.fromRawAmount(asWNATIVE.value ? token1.value : unwrappedToken1.value, discountedAmount1.value)
      : undefined
  })

  const outOfRange = computed(() =>
    pool.value && position.value ? pool.value.tickCurrent < position.value.tickLower || pool.value.tickCurrent >= position.value.tickUpper : false
  )

  const textBtn = computed(() => {
    return !account.value ? 'Connect wallet' : !percent.value ? 'Enter a percent' : 'Remove'
  })

  return {
    position: positionSDK,
    liquidityPercentage,
    pool,
    liquidityValue0,
    liquidityValue1,
    outOfRange,
    textBtn,
    discountedAmount0,
    discountedAmount1
  }
}
