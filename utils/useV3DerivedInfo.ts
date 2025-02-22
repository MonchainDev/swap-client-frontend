import { CurrencyAmount, Price, type Currency, type Token } from '@pancakeswap/swap-sdk-core'
import { Pool, Position, type FeeAmount } from '@pancakeswap/v3-sdk'
import { TICK_SPACINGS, TickMath, encodeSqrtRatioX96, nearestUsableTick, priceToClosestTick, tickToPrice } from '@pancakeswap/v3-sdk'
import { parseUnits } from 'viem'

type FullRange = true
export interface MintState {
  readonly leftRangeTypedValue: Price<Token, Token> | FullRange | undefined
  readonly rightRangeTypedValue: Price<Token, Token> | FullRange | undefined
}

export enum Bound {
  LOWER = 'LOWER',
  UPPER = 'UPPER'
}

export enum CurrencyField {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B'
}

export default function useV3DerivedInfo(
  currencyA?: Currency,
  currencyB?: Currency,
  feeAmount?: FeeAmount,
  baseCurrency?: Currency,
  leftRangeTypedValue?: Price<Token, Token> | FullRange,
  rightRangeTypedValue?: Price<Token, Token> | FullRange,
  independentField?: CurrencyField,
  typedValue?: string,
  startPriceTypedValue?: string
): {
  ticks: { [bound in Bound]?: number | undefined }
  invertPrice: boolean
  pricesAtTicks: {
    [bound in Bound]?: Price<Token, Token> | undefined
  }
  parsedAmounts: { [field in CurrencyField]?: CurrencyAmount<Currency> }
  price?: Price<Token, Token>
} {
  const baseToken = baseCurrency?.wrapped
  const tokenA = currencyA?.wrapped
  console.log('🚀 ~ tokenA:', tokenA)
  const tokenB = currencyB?.wrapped
  console.log('🚀 ~ tokenB:', tokenB)

  console.log('check token A before B', tokenA!.sortsBefore(tokenB!))

  const token0 = tokenA && tokenB && !tokenA.equals(tokenB) ? (tokenA.sortsBefore(tokenB!) ? tokenA : tokenB) : undefined
  const token1 = token0 && tokenA && tokenB ? (tokenA.equals(token0) ? tokenB : tokenA) : undefined

  const invertPrice = Boolean(baseToken && token0 && !baseToken.equals(token0))
  // parse typed range values and determine closest ticks
  // lower should always be a smaller tick
  const ticks: {
    [key: string]: number | undefined
  } = {
    [Bound.LOWER]: invertPrice ? tryParseTick(feeAmount, rightRangeTypedValue) : tryParseTick(feeAmount, leftRangeTypedValue),
    [Bound.UPPER]: invertPrice ? tryParseTick(feeAmount, leftRangeTypedValue) : tryParseTick(feeAmount, rightRangeTypedValue)
  }
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {}

  // always returns the price with 0 as base token
  const pricesAtTicks = {
    [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
    [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER])
  }

  const { [Bound.LOWER]: lowerPrice, [Bound.UPPER]: upperPrice } = pricesAtTicks

  const dependentField = independentField === CurrencyField.CURRENCY_A ? CurrencyField.CURRENCY_B : CurrencyField.CURRENCY_A

  // currencies
  const currencies: { [field in CurrencyField]?: Currency } = {
    [CurrencyField.CURRENCY_A]: currencyA,
    [CurrencyField.CURRENCY_B]: currencyB
  }
  // amounts
  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    typedValue,
    independentField ? currencies[independentField] : undefined
  )

  // always returns the price with 0 as base token
  const getPrice = (): Price<Token, Token> | undefined => {
    const parsedQuoteAmount = tryParseCurrencyAmount(startPriceTypedValue, invertPrice ? token0 : token1)
    if (parsedQuoteAmount && token0 && token1) {
      const baseAmount = tryParseCurrencyAmount('1', invertPrice ? token1 : token0)
      const p =
        baseAmount && parsedQuoteAmount
          ? new Price(baseAmount.currency, parsedQuoteAmount.currency, baseAmount.quotient, parsedQuoteAmount.quotient)
          : undefined
      return (invertPrice ? p?.invert() : p) ?? undefined
    }
    return undefined
  }

  // mark invalid range
  const invalidRange = Boolean(typeof tickLower === 'number' && typeof tickUpper === 'number' && tickLower >= tickUpper)

  // liquidity range warning
  const outOfRange = Boolean(
    !invalidRange && getPrice()! && lowerPrice && upperPrice && (getPrice()!.lessThan(lowerPrice) || getPrice()!.greaterThan(upperPrice))
  )

  // used for ratio calculation when pool not initialized
  const currentTick = priceToClosestTick(getPrice()!)
  const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick)
  const mockPool = new Pool(tokenA!, tokenB!, feeAmount!, currentSqrt, 0n, currentTick, [])
  console.log('🚀 ~ mockPool:', mockPool)

  // if pool exists use it, if not use the mock pool
  const poolForPosition: Pool | undefined = mockPool

  const dependentAmount = (): CurrencyAmount<Currency> | undefined => {
    // we wrap the currencies just to get the price in terms of the other token
    const wrappedIndependentAmount = independentAmount?.wrapped
    const dependentCurrency = dependentField === CurrencyField.CURRENCY_B ? currencyB : currencyA
    if (independentAmount && wrappedIndependentAmount && typeof tickLower === 'number' && typeof tickUpper === 'number' && poolForPosition) {
      // if price is out of range or invalid range - return 0 (single deposit will be independent)
      if (outOfRange || invalidRange) {
        return undefined
      }

      const position: Position | undefined = wrappedIndependentAmount.currency.equals(poolForPosition.token0)
        ? Position.fromAmount0({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount0: independentAmount.quotient,
            useFullPrecision: true // we want full precision for the theoretical position
          })
        : Position.fromAmount1({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount1: independentAmount.quotient
          })

      const dependentTokenAmount = wrappedIndependentAmount.currency.equals(poolForPosition.token0) ? position.amount1 : position.amount0
      return dependentCurrency && CurrencyAmount.fromRawAmount(dependentCurrency, dependentTokenAmount.quotient)
    }

    return undefined
  }

  const parsedAmounts: { [field in CurrencyField]: CurrencyAmount<Currency> | undefined } = {
    [CurrencyField.CURRENCY_A]: independentField === CurrencyField.CURRENCY_A ? independentAmount : dependentAmount(),
    [CurrencyField.CURRENCY_B]: independentField === CurrencyField.CURRENCY_A ? dependentAmount() : independentAmount
  }

  // const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {}

  function tryParseTick(feeAmount?: FeeAmount, price?: Price<Token, Token> | boolean): number | undefined {
    if (!price || !feeAmount || typeof price === 'boolean') {
      return undefined
    }

    let tick: number

    // check price is within min/max bounds, if outside return min/max
    const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator)

    if (sqrtRatioX96 >= TickMath.MAX_SQRT_RATIO) {
      tick = TickMath.MAX_TICK
    } else if (sqrtRatioX96 <= TickMath.MIN_SQRT_RATIO) {
      tick = TickMath.MIN_TICK
    } else {
      // this function is agnostic to the base, will always return the correct tick
      tick = priceToClosestTick(price)
    }

    return nearestUsableTick(tick, TICK_SPACINGS[feeAmount])
  }

  function getTickToPrice(baseToken?: Token, quoteToken?: Token, tick?: number): Price<Token, Token> | undefined {
    if (!baseToken || !quoteToken || typeof tick !== 'number') {
      return undefined
    }
    return tickToPrice(baseToken, quoteToken, tick)
  }

  function tryParseCurrencyAmount<T extends Currency>(value?: string, currency?: T): CurrencyAmount<T> | undefined {
    if (!value || !currency) {
      return undefined
    }
    try {
      const typedValueParsed = parseUnits(value as `${number}`, currency.decimals).toString()
      if (typedValueParsed !== '0') {
        return CurrencyAmount.fromRawAmount(currency, BigInt(typedValueParsed))
      }
    } catch (error) {
      // fails if the user specifies too many decimal places of precision (or maybe exceed max uint?)
      console.debug(`Failed to parse input amount: "${value}"`, error)
    }
    return undefined
  }

  return {
    ticks,
    invertPrice,
    pricesAtTicks,
    parsedAmounts,
    price: getPrice()
  }
}
