import { type SmartRouterTrade, type Route, SmartRouter } from '@monchain/smart-router'
import { CurrencyAmount, Fraction, Percent, type Currency, type TradeType } from '@monchain/swap-sdk-core'
import type { FeeAmount } from '@monchain/v3-sdk'

type TradeEssentialForPriceBreakdown = Pick<SmartRouterTrade<TradeType>, 'inputAmount' | 'outputAmount'> & {
  routes: Pick<Route, 'percent' | 'pools' | 'path' | 'inputAmount'>[]
}

const BIPS_BASE = 10000n
const BASE_FEE = new Percent(25n, BIPS_BASE)
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)
export const ONE_BIPS = new Percent(1n, BIPS_BASE)

// computes price breakdown for the trade
export function computeTradePriceBreakdown(trade?: TradeEssentialForPriceBreakdown | null): {
  priceImpactWithoutFee?: Percent | null
  lpFeeAmount?: CurrencyAmount<Currency> | null
} {
  if (!trade) {
    return {
      priceImpactWithoutFee: undefined,
      lpFeeAmount: null
    }
  }

  const { routes, outputAmount, inputAmount } = trade
  let feePercent = new Percent(0)
  let outputAmountWithoutPriceImpact = CurrencyAmount.fromRawAmount(trade.outputAmount.currency, 0)
  for (const route of routes) {
    const { inputAmount: routeInputAmount, pools, percent } = route
    const routeFeePercent = ONE_HUNDRED_PERCENT.subtract(
      pools.reduce<Percent>((currentFee, pool) => {
        if (SmartRouter.isV2Pool(pool)) {
          return currentFee.multiply(INPUT_FRACTION_AFTER_FEE)
        }
        if (SmartRouter.isStablePool(pool)) {
          return currentFee.multiply(ONE_HUNDRED_PERCENT.subtract(pool.fee))
        }
        if (SmartRouter.isV3Pool(pool)) {
          return currentFee.multiply(ONE_HUNDRED_PERCENT.subtract(v3FeeToPercent(pool.fee)))
        }
        return currentFee
      }, ONE_HUNDRED_PERCENT)
    )
    // Not accurate since for stable swap, the lp fee is deducted on the output side
    feePercent = feePercent.add(routeFeePercent.multiply(Percent.toPercent(parseNumberToFraction(percent / 100) || new Fraction(0))))

    const midPrice = SmartRouter.getMidPrice(route)
    outputAmountWithoutPriceImpact = outputAmountWithoutPriceImpact.add(
      CurrencyAmount.fromRawAmount(trade.outputAmount.currency, midPrice.wrapped.quote(routeInputAmount.wrapped).quotient)
    )
  }

  if (outputAmountWithoutPriceImpact.quotient === ZERO) {
    return {
      priceImpactWithoutFee: undefined,
      lpFeeAmount: null
    }
  }

  const priceImpactRaw = outputAmountWithoutPriceImpact.subtract(outputAmount).divide(outputAmountWithoutPriceImpact)
  const priceImpactPercent = new Percent(priceImpactRaw.numerator, priceImpactRaw.denominator)
  const priceImpactWithoutFee = priceImpactPercent.subtract(feePercent)
  const lpFeeAmount = inputAmount.multiply(feePercent)

  return {
    priceImpactWithoutFee,
    lpFeeAmount
  }
}

function parseNumberToFraction(num: number, precision = 6) {
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return undefined
  }
  const scalar = 10 ** precision
  const scaledNum = num * scalar

  if (Number.isNaN(scaledNum) || !Number.isFinite(scaledNum)) {
    return undefined
  }

  return new Fraction(BigInt(Math.floor(scaledNum)), BigInt(scalar))
}

function v3FeeToPercent(fee: FeeAmount): Percent {
  return new Percent(fee, BIPS_BASE * 100n)
}
