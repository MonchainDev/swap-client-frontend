import { ChainId } from '~/types'

const URL_SCAN = {
  [ChainId.MON_TESTNET]: {
    tx: 'https://dev.explorer.monchain.info/tx',
    address: 'https://dev.explorer.monchain.info/address'
  },
  [ChainId.AMOY_POLYGON]: {
    tx: 'https://amoy.polygonscan.com/tx',
    address: 'https://amoy.polygonscan.com/address'
  },
  [ChainId.BSC_TESTNET]: {
    tx: 'https://testnet.bscscan.com/tx',
    address: 'https://testnet.bscscan.com/address'
  },
  [ChainId.SEPOLIA]: {
    tx: 'https://sepolia.etherscan.io/tx',
    address: 'https://sepolia.etherscan.io/address'
  },
  [ChainId.ARBITRUM_SEPOLIA]: {
    tx: 'https://sepolia.etherscan.io/tx',
    address: 'https://sepolia.etherscan.io/address'
  }
} as const satisfies Record<ChainId, { tx: string; address: string }>

export default URL_SCAN
