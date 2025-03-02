import type { ZoomLevels } from '~/types'
import { FeeAmount } from './fee'

export const ZOOM_LEVELS: Record<FeeAmount, ZoomLevels> = {
  [FeeAmount.LOWEST]: {
    initialMin: 0.999,
    initialMax: 1.001,
    min: 0.00001,
    max: 1.5
  },
  [FeeAmount.LOW]: {
    initialMin: 0.999,
    initialMax: 1.001,
    min: 0.00001,
    max: 1.5
  },
  [FeeAmount.MEDIUM]: {
    initialMin: 0.5,
    initialMax: 2,
    min: 0.00001,
    max: 20
  },
  [FeeAmount.HIGH]: {
    initialMin: 0.5,
    initialMax: 2,
    min: 0.00001,
    max: 20
  }
}
