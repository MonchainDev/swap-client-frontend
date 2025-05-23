import type { Price, Token } from '@monchain/sdk'
import { Bound } from '~/types'

export function formatTickPrice(
  price: Price<Token, Token> | undefined,
  atLimit: { [bound in Bound]?: boolean | undefined },
  direction: Bound,
  locale: string,
  placeholder?: string
) {
  if (atLimit[direction]) {
    return direction === Bound.LOWER ? '0' : '∞'
  }

  if (!price && placeholder !== undefined) {
    return placeholder
  }

  if (price?.greaterThan(1e15)) {
    return '∞'
  }

  return formatPrice(price, 6, locale)
}
