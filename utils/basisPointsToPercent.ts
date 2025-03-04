import { Percent } from '@monchain/swap-sdk-core'
import { BIPS_BASE } from '~/constant'

const basisPointsToPercent = useMemoize((num: number): Percent => {
  return new Percent(BigInt(num), BIPS_BASE)
})

export default basisPointsToPercent
