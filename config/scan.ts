import { ChainId } from '~/types'

const DOMAIN_SCAN = {
  [ChainId.MON_TESTNET]: 'https://dev.explorer.monchain.info',
  [ChainId.AMOY_POLYGON]: 'https://amoy.polygonscan.com',
  [ChainId.BSC_TESTNET]: 'https://testnet.bscscan.com',
  [ChainId.SEPOLIA]: 'https://sepolia.etherscan.io',
  [ChainId.ARBITRUM_SEPOLIA]: 'https://sepolia.etherscan.io'
} as const satisfies Record<ChainId, string>

const URL_SCAN = {
  [ChainId.MON_TESTNET]: {
    tx: DOMAIN_SCAN[ChainId.MON_TESTNET] + '/tx',
    address: DOMAIN_SCAN[ChainId.MON_TESTNET] + '/address',
    token: DOMAIN_SCAN[ChainId.MON_TESTNET] + '/token'
  },
  [ChainId.AMOY_POLYGON]: {
    tx: DOMAIN_SCAN[ChainId.AMOY_POLYGON] + '/tx',
    address: DOMAIN_SCAN[ChainId.AMOY_POLYGON] + '/address',
    token: DOMAIN_SCAN[ChainId.AMOY_POLYGON] + '/token'
  },
  [ChainId.BSC_TESTNET]: {
    tx: DOMAIN_SCAN[ChainId.BSC_TESTNET] + '/tx',
    address: DOMAIN_SCAN[ChainId.BSC_TESTNET] + '/address',
    token: DOMAIN_SCAN[ChainId.BSC_TESTNET] + '/token'
  },
  [ChainId.SEPOLIA]: {
    tx: DOMAIN_SCAN[ChainId.SEPOLIA] + '/tx',
    address: DOMAIN_SCAN[ChainId.SEPOLIA] + '/address',
    token: DOMAIN_SCAN[ChainId.SEPOLIA] + '/token'
  },
  [ChainId.ARBITRUM_SEPOLIA]: {
    tx: DOMAIN_SCAN[ChainId.ARBITRUM_SEPOLIA] + '/tx',
    address: DOMAIN_SCAN[ChainId.ARBITRUM_SEPOLIA] + '/address',
    token: DOMAIN_SCAN[ChainId.ARBITRUM_SEPOLIA] + '/token'
  }
} as const satisfies Record<ChainId, { tx: string; address: string; token: string }>

const EXPLORER_NAME = {
  [ChainId.MON_TESTNET]: 'Mon explorer',
  [ChainId.AMOY_POLYGON]: 'Amoy explorer',
  [ChainId.BSC_TESTNET]: 'Bsc explorer',
  [ChainId.SEPOLIA]: 'Etherscan explorer',
  [ChainId.ARBITRUM_SEPOLIA]: 'Arbitrum explorer'
} as const satisfies Record<ChainId, string>

export { URL_SCAN, DOMAIN_SCAN, EXPLORER_NAME }
