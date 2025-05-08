import { CurrencyAmount, Percent, type Token } from '@wicchain/swap-sdk-core'
import type { Pool } from '@wicchain/v3-sdk'
import { Position } from '@wicchain/v3-sdk'
import { type PositionDetail } from '~/types'

export default function useDerivedV3BurnInfo(position: Ref<PositionDetail | undefined>, percent: Ref<string>, asWNATIVE: Ref<boolean>) {
  const { chainId } = useActiveChainId()

  const { form, feeAmount } = storeToRefs(useLiquidityStore())

  const token0 = ref<Token>()
  const token1 = ref<Token>()
  // const token0 = computed(() => unwrappedToken(token0.value))
  // const token1 = computed(() => unwrappedToken(token1.value))

  watchEffect(async () => {
    if (position.value) {
      token0.value = await getTokenByChainId(position.value.token0 as string, chainId.value!)
      token1.value = await getTokenByChainId(position.value.token1 as string, chainId.value!)
      feeAmount.value = position.value.fee ?? 0
    }
  })

  // if pool has aNATIVE, set token0 or 1 to NATIVE\

  watch(
    () => token0.value,
    () => {
      if (token0.value) {
        form.value.token0 = {
          ...form.value.token0,
          ...token0.value,
          icon_url: '',
          name: token0.value?.name || '',
          decimals: token0.value?.decimals ?? 18,
          symbol: token0.value?.symbol ?? '',
          address: token0.value.isNative ? zeroAddress : (token0.value?.address as string),
          tokenSymbol: token0.value?.symbol ?? '',
          tokenAddress: token0.value.isNative ? zeroAddress : (token0.value?.address as string),
          tokenDecimals: token0.value?.decimals ?? 18,
          chainId: token0.value.chainId
        }
      }
    }
  )
  watch(
    () => token1.value,
    () => {
      if (token1.value) {
        form.value.token1 = {
          ...form.value.token1,
          ...token1.value,
          icon_url: '',
          name: token1.value?.name || '',
          decimals: token1.value?.decimals ?? 18,
          symbol: token1.value?.symbol ?? '',
          address: token1.value.isNative ? '' : (token1.value?.address as string),
          tokenSymbol: token1.value?.symbol ?? '',
          tokenAddress: token1.value.isNative ? '' : (token1.value?.address as string),
          tokenDecimals: token1.value?.decimals ?? 18,
          chainId: token1.value.chainId
        }
      }
    }
  )
  // watchEffect(() => {
  //   if (token0.value && token1.value) {
  //     console.log('watchEffect in useDerivedV3BurnInfo', token0.value, token1.value)

  //     form.value.token0 = {
  //       ...form.value.token0,
  //       ...token0.value,
  //       icon_url: '',
  //       name: token0.value?.name || '',
  //       decimals: token0.value?.decimals ?? 18,
  //       symbol: token0.value?.symbol ?? '',
  //       address: token0.value.isNative ? '' : (token0.value?.address as string),
  //       tokenSymbol: token0.value?.symbol ?? '',
  //       tokenAddress: token0.value.isNative ? '' : (token0.value?.address as string),
  //       tokenDecimals: token0.value?.decimals ?? 18,
  //       chainId: token0.value.chainId
  //     }
  //     form.value.token1 = {
  //       ...form.value.token1,
  //       ...token1.value,
  //       icon_url: '',
  //       name: token1.value?.name || '',
  //       decimals: token1.value?.decimals ?? 18,
  //       symbol: token1.value?.symbol ?? '',
  //       address: token1.value.isNative ? '' : (token1.value?.address as string),
  //       tokenSymbol: token1.value?.symbol ?? '',
  //       tokenAddress: token1.value.isNative ? '' : (token1.value?.address as string),
  //       tokenDecimals: token1.value?.decimals ?? 18,
  //       chainId: token1.value.chainId
  //     }
  //   }
  // })

  const liquidityPercentage = computed(() => {
    return percent.value === null || percent.value === undefined ? undefined : new Percent(Math.floor(+percent.value), 100)
  })
  const { pool } = usePools()

  const { feeValue0, feeValue1, owner } = useV3PositionFees(pool as Ref<Pool>, asWNATIVE.value)

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

  return {
    position: positionSDK,
    liquidityPercentage,
    pool,
    liquidityValue0,
    liquidityValue1,
    outOfRange,
    discountedAmount0,
    discountedAmount1,
    feeValue0,
    feeValue1,
    owner,
    token0,
    token1
  }
}
