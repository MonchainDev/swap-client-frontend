import { SmartRouter, type SmartRouterTrade } from '@wicchain/smart-router'
import type { Currency, CurrencyAmount, TradeType } from '@wicchain/swap-sdk-core'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export type SlippageAdjustedAmounts = {
  [field in Field]?: CurrencyAmount<Currency> | null
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(trade: SmartRouterTrade<TradeType>, allowedSlippage: number): SlippageAdjustedAmounts {
  const pct = basisPointsToPercent(allowedSlippage)

  return {
    [Field.INPUT]: trade && SmartRouter.maximumAmountIn(trade, pct),
    [Field.OUTPUT]: trade && SmartRouter.minimumAmountOut(trade, pct)
  }
}
