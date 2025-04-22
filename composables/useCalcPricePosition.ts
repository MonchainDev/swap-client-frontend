import { Token } from '@monchain/swap-sdk-core'
import { TICK_SPACINGS, TickMath, tickToPrice } from '@monchain/v3-sdk'
import { LIST_NETWORK } from '~/config/networks'
import type { FeeAmount } from '~/constant/fee'
import { Bound } from '~/types'
import type { IPosition } from '~/types/position.type'

export default function useCalcPricePosition(positionValue: () => IPosition | undefined) {
  const position = computed(() => {
    if (!positionValue) return undefined
    return positionValue()
  })

  const chainId = computed(() => {
    if (!position.value) return undefined
    return LIST_NETWORK.find((item) => item.network === position.value?.network)?.chainId
  })

  const tickSpaceLimits = computed(() => {
    return {
      [Bound.LOWER]: position.value?.fee ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[position.value.fee as FeeAmount]) : undefined,
      [Bound.UPPER]: position.value?.fee ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[position.value.fee as FeeAmount]) : undefined
    }
  })

  // specifies whether the lower and upper ticks is at the extreme bounds
  const ticksAtLimit = computed((): { [bound in Bound]?: boolean | undefined } => ({
    [Bound.LOWER]: position.value?.fee ? position.value.tickLower === tickSpaceLimits.value[Bound.LOWER] : undefined,
    [Bound.UPPER]: position.value?.fee ? position.value.tickUpper === tickSpaceLimits.value[Bound.UPPER] : undefined
  }))

  const min = computed(() => {
    if (!position.value) {
      return 0
    }
    const { baseSymbol, baseDecimals, tokenQuote, tokenBase, quoteDecimals, quoteSymbol, tickLower } = position.value
    const baseToken = new Token(chainId.value!, tokenBase as `0x`, baseDecimals, baseSymbol)
    const quoteToken = new Token(chainId.value!, tokenQuote as `0x`, quoteDecimals, quoteSymbol)

    const tickPrice = tickToPrice(baseToken, quoteToken, tickLower)

    return formatTickPrice(tickPrice, ticksAtLimit.value, Bound.LOWER, 'en-US')
  })

  const max = computed(() => {
    if (!position.value) {
      return 0
    }
    const { baseSymbol, baseDecimals, tokenQuote, tokenBase, quoteDecimals, quoteSymbol, tickUpper } = position.value
    const baseToken = new Token(chainId.value!, tokenBase as `0x`, baseDecimals, baseSymbol)
    const quoteToken = new Token(chainId.value!, tokenQuote as `0x`, quoteDecimals, quoteSymbol)

    const tickPrice = tickToPrice(baseToken, quoteToken, tickUpper)

    return formatTickPrice(tickPrice, ticksAtLimit.value, Bound.UPPER, 'en-US')
  })
  return { min, max }
}
