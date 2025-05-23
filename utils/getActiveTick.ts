import type { FeeAmount } from '@monchain/v3-sdk'
import { TICK_SPACINGS } from '@monchain/v3-sdk'

export const getActiveTick = (tickCurrent: number | undefined, feeAmount: FeeAmount | undefined) =>
  tickCurrent !== undefined && feeAmount ? Math.floor(tickCurrent / TICK_SPACINGS[feeAmount]) * TICK_SPACINGS[feeAmount] : undefined
