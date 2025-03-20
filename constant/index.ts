import { type IToken, type ZoomLevels } from '~/types'
import { FeeAmount } from './fee'
import { ZOOM_LEVELS } from './zoom-level'

const DEFAULT_SLIPPAGE = '1'
const DECIMALS_NATIVE = 18

const NATIVE_TOKEN: IToken = {
  name: 'Mon',
  symbol: 'MON',
  decimals: 18,
  icon_url: 'https://cryptologos.cc/logos/compound-comp-logo.png?v=040',
  address: '',
  id: 0,
  tokenSymbol: 'MON',
  tokenAddress: '',
  tokenDecimals: 18,
  network: 'MON',
  chainId: 16789,
  stable: true,
  crossChain: false
}

const WRAPPED_NATIVE_TOKEN: IToken = {
  name: 'Mon',
  symbol: 'WMON',
  decimals: 18,
  icon_url: 'https://cryptologos.cc/logos/compound-comp-logo.png?v=040',
  address: '0xF76eF13fb6B775e4609C921cAA1BD9307E338276',
  id: 0,
  tokenSymbol: 'WMON',
  tokenAddress: '0xF76eF13fb6B775e4609C921cAA1BD9307E338276',
  tokenDecimals: 18,
  network: 'MON',
  chainId: 16789,
  stable: false,
  crossChain: false
}

const EMPTY_TOKEN: IToken = {
  name: '',
  symbol: '',
  decimals: 0,
  icon_url: '',
  address: '',
  id: 0,
  tokenSymbol: '',
  tokenAddress: '',
  tokenDecimals: 0,
  network: '',
  chainId: 0,
  stable: false,
  crossChain: false
}

const QUICK_ACTION_CONFIGS: Record<FeeAmount | string, { [percentage: number]: ZoomLevels }> = {
  [FeeAmount.LOWEST]: {
    0.1: {
      initialMin: 0.999,
      initialMax: 1.001,
      min: 0.00001,
      max: 1.5
    },
    0.5: {
      initialMin: 0.995,
      initialMax: 1.005,
      min: 0.00001,
      max: 1.5
    },
    1: {
      initialMin: 0.99,
      initialMax: 1.01,
      min: 0.00001,
      max: 1.5
    }
  },
  [FeeAmount.LOW]: {
    5: {
      initialMin: 0.95,
      initialMax: 1.054,
      min: 0.00001,
      max: 1.5
    },
    10: {
      initialMin: 0.9,
      initialMax: 1.11,
      min: 0.00001,
      max: 1.5
    },
    20: {
      initialMin: 0.8,
      initialMax: 1.25,
      min: 0.00001,
      max: 1.5
    }
  },
  [FeeAmount.MEDIUM]: {
    10: {
      initialMin: 0.9,
      initialMax: 1.11,
      min: 0.00001,
      max: 20
    },
    20: {
      initialMin: 0.8,
      initialMax: 1.25,
      min: 0.00001,
      max: 20
    },
    50: ZOOM_LEVELS[FeeAmount.MEDIUM]
  },
  [FeeAmount.HIGH]: {
    10: {
      initialMin: 0.9,
      initialMax: 1.1,
      min: 0.00001,
      max: 1.5
    },
    20: {
      initialMin: 0.8,
      initialMax: 1.25,
      min: 0.00001,
      max: 20
    },
    50: ZOOM_LEVELS[FeeAmount.HIGH]
  }
}

const LIST_FEE_AMOUNT = [
  {
    value: FeeAmount.LOWEST,
    description: 'Best for very stable pairs.'
  },
  {
    value: FeeAmount.LOW,
    description: 'Best for stable pairs.'
  },
  {
    value: FeeAmount.MEDIUM,
    description: 'Best for most pairs.'
  },
  {
    value: FeeAmount.HIGH,
    description: 'Best for exotic pairs.'
  }
]

const BIPS_BASE = 10000n

const FAST_INTERVAL = 10000
const SLOW_INTERVAL = 60000

const MAX_NUMBER_APPROVE = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

export {
  BIPS_BASE,
  DECIMALS_NATIVE,
  DEFAULT_SLIPPAGE,
  EMPTY_TOKEN,
  FAST_INTERVAL,
  LIST_FEE_AMOUNT,
  NATIVE_TOKEN,
  QUICK_ACTION_CONFIGS,
  SLOW_INTERVAL,
  WRAPPED_NATIVE_TOKEN,
  MAX_NUMBER_APPROVE
}
