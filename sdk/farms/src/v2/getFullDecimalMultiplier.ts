import BN from 'bignumber.js'
import { BIG_TEN } from '@monswap/utils/bigNumber'
import memoize from 'lodash/memoize'

export const getFullDecimalMultiplier = memoize((decimals: number): BN => {
  return BIG_TEN.pow(decimals)
})
