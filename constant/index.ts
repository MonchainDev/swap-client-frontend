import { ChainId, type INetwork, type IToken, type ZoomLevels } from '~/types'
import { ZOOM_LEVELS } from './zoom-level'
import { FeeAmount } from './fee'

const DEFAULT_SLIPPAGE = '1'
const DECIMALS_NATIVE = 18

const NATIVE_TOKEN: IToken = {
  name: 'Mon',
  symbol: 'MON',
  decimals: 18,
  icon_url: 'https://cryptologos.cc/logos/compound-comp-logo.png?v=040',
  address: ''
}

const WRAPPED_NATIVE_TOKEN: IToken = {
  name: 'Mon',
  symbol: 'WMON',
  decimals: 18,
  icon_url: 'https://cryptologos.cc/logos/compound-comp-logo.png?v=040',
  address: '0xF76eF13fb6B775e4609C921cAA1BD9307E338276'
}

const LIST_NETWORK: INetwork[] = [
  {
    title: 'BNB Chain',
    logo: '/logo-bnb-chain.png',
    value: 'BNB',
    chainId: ChainId.BSC_TESTNET
  },
  {
    title: 'Ethereum',
    logo: '/logo-ethereum-chain.png',
    value: 'ETH',
    chainId: ChainId.SEPOLIA
  },
  {
    title: 'Polygon',
    logo: '/logo-polygon-chain.png',
    value: 'MATIC',
    chainId: ChainId.POLYGON
  },
  {
    title: 'Mon Chain',
    logo: '/logo-mon-chain.png',
    value: 'MON',
    chainId: ChainId.MON_TESTNET
  },
  {
    title: 'Linea Chain',
    logo: '/logo-liena-chain.png',
    value: 'LINEA',
    chainId: ChainId.LINEA
  }
]

const DEFAULT_NETWORK: INetwork = {
  title: 'Mon Chain',
  logo: '/logo-mon-chain.png',
  value: 'MON',
  chainId: ChainId.MON_TESTNET
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

export {
  DEFAULT_SLIPPAGE,
  DECIMALS_NATIVE,
  NATIVE_TOKEN,
  WRAPPED_NATIVE_TOKEN,
  LIST_NETWORK,
  DEFAULT_NETWORK,
  QUICK_ACTION_CONFIGS,
  LIST_FEE_AMOUNT,
  BIPS_BASE,
  SLOW_INTERVAL,
  FAST_INTERVAL
}
