import type { Pool } from '@monswap/routing-sdk'

import { V3_POOL_TYPE } from '../constants'
import type { V3Pool } from '../types'

export function isV3Pool(p: Pool): p is V3Pool {
  return p.type === V3_POOL_TYPE
}
