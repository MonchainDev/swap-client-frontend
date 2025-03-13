import type { Token } from '@monchain/swap-sdk-core'
import { CurrencyAmount, Price } from '@monchain/swap-sdk-core'
import { encodeSqrtRatioX96, nearestUsableTick, Pool, Position, priceToClosestTick, TICK_SPACINGS, TickMath, type FeeAmount } from '@monchain/v3-sdk'
import { ZOOM_LEVELS } from '~/constant/zoom-level'
import { BIG_INT_ZERO, Bound, CurrencyField } from '~/types'

export default function useV3DerivedInfo() {
  const {
    feeAmount,
    typedValue,
    startPriceTypedValue,
    existingPosition,
    leftRangeTypedValue,
    rightRangeTypedValue,
    independentField,
    baseCurrency,
    quoteCurrency
  } = storeToRefs(useLiquidityStore())

  const { dispatchRangeTypedValue } = useLiquidityStore()

  const dependentField = computed(() => {
    return independentField.value === CurrencyField.CURRENCY_A ? CurrencyField.CURRENCY_B : CurrencyField.CURRENCY_A
  })

  //currencies
  const currencies = computed(() => {
    return {
      [CurrencyField.CURRENCY_A]: baseCurrency.value,
      [CurrencyField.CURRENCY_B]: quoteCurrency.value
    }
  })

  // formatted with tokens
  const tokenA = computed(() => {
    return baseCurrency.value?.wrapped
  })
  const tokenB = computed(() => quoteCurrency.value?.wrapped)
  const baseToken = computed(() => baseCurrency.value?.wrapped)

  const token0 = computed(() => {
    if (tokenA.value && tokenB.value && !tokenA.value.equals(tokenB.value)) {
      return tokenA.value.sortsBefore(tokenB.value) ? tokenA.value : tokenB.value
    }
    return undefined
  })
  const token1 = computed(() => {
    if (tokenA.value && tokenB.value && !tokenA.value.equals(tokenB.value)) {
      return tokenA.value.sortsBefore(tokenB.value) ? tokenB.value : tokenA.value
    }
    return undefined
  })

  const { pool, poolAddresses } = usePools()
  const noLiquidity = computed(() => !pool.value)

  const invertPrice = computed(() => Boolean(baseToken.value && token0.value && !baseToken.value.equals(token0.value)))

  const price = computed(() => {
    if (noLiquidity.value) {
      const parsedQuoteAmount = tryParseCurrencyAmount(startPriceTypedValue.value, invertPrice.value ? token0.value : token1.value)
      if (parsedQuoteAmount && token0 && token1) {
        const baseAmount = tryParseCurrencyAmount('1', invertPrice.value ? token1.value : token0.value)
        const p =
          baseAmount && parsedQuoteAmount
            ? new Price(baseAmount.currency, parsedQuoteAmount.currency, baseAmount.quotient, parsedQuoteAmount.quotient)
            : undefined
        return (invertPrice.value ? p?.invert() : p) ?? undefined
      }
      return undefined
    }
    // get the amount of quote currency
    return pool.value && token0.value ? pool.value.priceOf(token0.value) : undefined
  })

  // set min and max price default if pool exits
  watch(
    () => pool.value?.fee,
    (value) => {
      if (value) {
        const currentPrice = price.value ? parseFloat((invertPrice.value ? price.value.invert() : price.value).toSignificant(8)) : undefined
        if (currentPrice) {
          dispatchRangeTypedValue('BOTH', currentPrice, ZOOM_LEVELS[value])
        }
      } else {
        pool.value = undefined
      }
    }
  )

  // check for invalid price input (converts to invalid ratio)
  const invalidPrice = computed(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.value!.numerator, price.value!.denominator) : undefined
    return price && sqrtRatioX96 && !(sqrtRatioX96 >= TickMath.MIN_SQRT_RATIO && sqrtRatioX96 < TickMath.MAX_SQRT_RATIO)
  })

  // used for ratio calculation when pool not initialized
  const mockPool = computed(() => {
    if (!pool.value && tokenA.value && tokenB.value && feeAmount.value && price.value && !invalidPrice.value) {
      const currentTick = priceToClosestTick(price.value)
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick)
      return new Pool(tokenA.value, tokenB.value, feeAmount.value, currentSqrt, 0n, currentTick, [])
    }
    return undefined
  })

  // if pool exists use it, if not use the mock pool
  const poolForPosition = computed(() => {
    return (pool.value as Pool) ?? mockPool.value
  })

  // lower and upper limits in the tick space for `feeAmoun<Trans>
  const tickSpaceLimits = computed(() => {
    return {
      [Bound.LOWER]: feeAmount.value ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount.value as unknown as FeeAmount]) : undefined,
      [Bound.UPPER]: feeAmount.value ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount.value as unknown as FeeAmount]) : undefined
    }
  })

  // parse typed range values and determine closest ticks
  // lower should always be a smaller tick
  const ticks = computed(() => {
    return {
      [Bound.LOWER]:
        typeof existingPosition.value?.tickLower === 'number'
          ? existingPosition.value.tickLower
          : (invertPrice.value && typeof rightRangeTypedValue.value === 'boolean') || (!invertPrice.value && typeof leftRangeTypedValue.value === 'boolean')
            ? tickSpaceLimits.value[Bound.LOWER]
              ? tickSpaceLimits.value[Bound.LOWER]
              : tickSpaceLimits.value[Bound.LOWER]
            : invertPrice.value
              ? tryParseTick(feeAmount.value, rightRangeTypedValue.value as boolean | Price<Token, Token> | undefined)
              : tryParseTick(feeAmount.value, leftRangeTypedValue.value as boolean | Price<Token, Token> | undefined),
      [Bound.UPPER]:
        typeof existingPosition.value?.tickUpper === 'number'
          ? checkAndParseMaxTick(existingPosition.value.tickUpper)
          : (!invertPrice.value && typeof rightRangeTypedValue.value === 'boolean') || (invertPrice.value && typeof leftRangeTypedValue.value === 'boolean')
            ? tickSpaceLimits.value[Bound.UPPER]
              ? checkAndParseMaxTick(tickSpaceLimits.value[Bound.UPPER])
              : tickSpaceLimits.value[Bound.UPPER]
            : invertPrice.value
              ? tryParseTick(feeAmount.value, leftRangeTypedValue.value as boolean | Price<Token, Token> | undefined)
              : tryParseTick(feeAmount.value, rightRangeTypedValue.value as boolean | Price<Token, Token> | undefined)
    }
  })

  const tickLower = computed(() => ticks.value[Bound.LOWER])
  const tickUpper = computed(() => ticks.value[Bound.UPPER])

  // specifies whether the lower and upper ticks is at the extreme bounds
  const ticksAtLimit = computed((): { [bound in Bound]?: boolean | undefined } => ({
    [Bound.LOWER]: feeAmount.value ? tickLower.value === tickSpaceLimits.value[Bound.LOWER] : undefined,
    [Bound.UPPER]: feeAmount.value ? tickUpper.value === tickSpaceLimits.value[Bound.UPPER] : undefined
  }))

  // mark invalid range
  const invalidRange = computed(() => Boolean(typeof tickLower.value === 'number' && typeof tickUpper.value === 'number' && tickLower.value >= tickUpper.value))

  // always returns the price with 0 as base token
  const pricesAtTicks = computed(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0.value, token1.value, ticks.value[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0.value, token1.value, ticks.value[Bound.UPPER])
    }
  })

  const lowerPrice = computed(() => pricesAtTicks.value[Bound.LOWER])
  const upperPrice = computed(() => pricesAtTicks.value[Bound.UPPER])

  // liquidity range warning
  const outOfRange = computed(() =>
    Boolean(
      !invalidRange.value &&
        price.value &&
        lowerPrice.value &&
        upperPrice.value &&
        (price.value.lessThan(lowerPrice.value) || price.value.greaterThan(upperPrice.value))
    )
  )
  // amounts
  const independentAmount = computed(() => {
    return tryParseCurrencyAmount(typedValue.value, independentField.value ? currencies.value[independentField.value] : undefined)
  })

  const dependentAmount = computed(() => {
    // we wrap the currencies just to get the price in terms of the other token
    const wrappedIndependentAmount = independentAmount.value?.wrapped
    const dependentCurrency = dependentField.value === CurrencyField.CURRENCY_B ? quoteCurrency.value : baseCurrency.value

    const isValid =
      independentAmount.value && wrappedIndependentAmount && typeof tickLower.value === 'number' && typeof tickUpper.value === 'number' && poolForPosition.value

    if (isValid) {
      // if price is out of range or invalid range - return 0 (single deposit will be independent)
      if (outOfRange.value || invalidRange.value) {
        console.error('out of range or invalid range')
        return undefined
      }

      const position: Position | undefined = wrappedIndependentAmount.currency.equals(poolForPosition.value.token0)
        ? Position.fromAmount0({
            pool: poolForPosition.value,
            tickLower: tickLower.value,
            tickUpper: tickUpper.value,
            amount0: independentAmount.value.quotient,
            useFullPrecision: true // we want full precision for the theoretical position
          })
        : Position.fromAmount1({
            pool: poolForPosition.value,
            tickLower: tickLower.value,
            tickUpper: tickUpper.value,
            amount1: independentAmount.value.quotient
          })

      const dependentTokenAmount = wrappedIndependentAmount.currency.equals(poolForPosition.value.token0) ? position.amount1 : position.amount0
      return dependentCurrency && CurrencyAmount.fromRawAmount(dependentCurrency, dependentTokenAmount.quotient)
    }
    return undefined
  })

  const parsedAmounts = computed(() => {
    return {
      [CurrencyField.CURRENCY_A]: independentField.value === CurrencyField.CURRENCY_A ? independentAmount.value : dependentAmount.value,
      [CurrencyField.CURRENCY_B]: independentField.value === CurrencyField.CURRENCY_A ? dependentAmount.value : independentAmount.value
    }
  })

  const formattedAmounts = computed(() => {
    return {
      [independentField.value]: typedValue.value,
      [dependentField.value]: parsedAmounts.value[dependentField.value]?.toSignificant(6) ?? ''
    }
  })

  // single deposit only if price is out of range
  const deposit0Disabled = computed(() =>
    Boolean(typeof tickUpper.value === 'number' && poolForPosition.value && poolForPosition.value.tickCurrent >= tickUpper.value)
  )
  const deposit1Disabled = computed(() =>
    Boolean(typeof tickLower.value === 'number' && poolForPosition.value && poolForPosition.value.tickCurrent <= tickLower.value)
  )

  // sorted for token order
  const depositADisabled = computed(() => {
    return (
      invalidRange.value ||
      Boolean(
        (deposit0Disabled.value && poolForPosition.value && tokenA.value && poolForPosition.value.token0.equals(tokenA.value)) ||
          (deposit1Disabled.value && poolForPosition.value && tokenA.value && poolForPosition.value.token1.equals(tokenA.value))
      )
    )
  })
  const depositBDisabled = computed(() => {
    return (
      invalidRange.value ||
      Boolean(
        (deposit0Disabled.value && poolForPosition.value && tokenB.value && poolForPosition.value.token0.equals(tokenB.value)) ||
          (deposit1Disabled.value && poolForPosition.value && tokenB.value && poolForPosition.value.token1.equals(tokenB.value))
      )
    )
  })

  // create position entity based on users selection
  const position = computed(() => {
    if (
      !poolForPosition.value ||
      !tokenA.value ||
      !tokenB.value ||
      typeof tickLower.value !== 'number' ||
      typeof tickUpper.value !== 'number' ||
      invalidRange.value
    ) {
      return undefined
    }

    // mark as 0 if disabled because out of range
    const amount0 = !deposit0Disabled.value
      ? parsedAmounts.value?.[tokenA.value.equals(poolForPosition.value?.token0) ? CurrencyField.CURRENCY_A : CurrencyField.CURRENCY_B]?.quotient
      : BIG_INT_ZERO
    const amount1 = !deposit1Disabled.value
      ? parsedAmounts.value?.[tokenA.value.equals(poolForPosition.value?.token0) ? CurrencyField.CURRENCY_B : CurrencyField.CURRENCY_A]?.quotient
      : BIG_INT_ZERO

    if (amount0 !== undefined && amount1 !== undefined) {
      return Position.fromAmounts({
        pool: poolForPosition.value,
        tickLower: tickLower.value,
        tickUpper: tickUpper.value,
        amount0,
        amount1,
        useFullPrecision: true // we want full precision for the theoretical position
      })
    }
    return undefined
  })

  /**
   * if fee tier = 100 then TickMath.MAX_TICK will cause overflow, so minus 1 here
   */
  function checkAndParseMaxTick(tick: number) {
    if (tick === TickMath.MAX_TICK) {
      return TickMath.MAX_TICK - 1
    }
    return tick
  }

  return {
    invertPrice,
    price,
    tickSpaceLimits,
    ticks,
    poolForPosition,
    parsedAmounts,
    tokenA,
    tokenB,
    token1,
    token0,
    pricesAtTicks,
    lowerPrice,
    dependentAmount,
    upperPrice,
    independentAmount,
    tickLower,
    tickUpper,
    invalidRange,
    baseToken,
    outOfRange,
    pool,
    position,
    noLiquidity,
    ticksAtLimit,
    currencies,
    dependentField,
    formattedAmounts,
    depositADisabled,
    depositBDisabled,
    deposit0Disabled,
    deposit1Disabled,
    poolAddresses
  }
}
