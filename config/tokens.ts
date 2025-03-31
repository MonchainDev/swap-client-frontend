import { ERC20Token } from '@monchain/swap-sdk-evm'
import { ChainId } from '~/types'

/** Token reward  */
export const TOKEN_REWARDS = {
  [ChainId.BSC_TESTNET]: new ERC20Token(ChainId.BSC_TESTNET, '0x0BEcA28adA7314Ff85E95a79CDAFd0513e2A7369', 18, 'ORB', 'ORB', ''),
  [ChainId.MON_TESTNET]: new ERC20Token(ChainId.MON_TESTNET, '0x3b9547e5b66Fd8dB8b3119575f7d809C4DcE6243', 18, 'ORB', 'ORB', ''),
  [ChainId.SEPOLIA]: null,
  [ChainId.AMOY_POLYGON]: null,
  [ChainId.ARBITRUM_SEPOLIA]: null
} as Record<ChainId, ERC20Token | null>

/** Wrapped native in amoy polygon  */
export const WPOL = {
  [ChainId.AMOY_POLYGON]: new ERC20Token(ChainId.AMOY_POLYGON, '0xA5733b3A8e62A8faF43b0376d5fAF46E89B3033E', 18, 'WPOL', 'Wrapped Polygon', '')
}

/** Wrapped native in ethereum  */
export const WETH9 = {
  [ChainId.BSC_TESTNET]: new ERC20Token(ChainId.BSC_TESTNET, '0xE7bCB9e341D546b66a46298f4893f5650a56e99E', 18, 'ETH', 'ETH', 'https://ethereum.org'),
  [ChainId.SEPOLIA]: new ERC20Token(ChainId.SEPOLIA, '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', 18, 'WETH', 'Wrapped Ether', 'https://weth.io'),
  [ChainId.ARBITRUM_SEPOLIA]: new ERC20Token(
    ChainId.ARBITRUM_SEPOLIA,
    '0x1bdc540dEB9Ed1fA29964DeEcCc524A8f5e2198e',
    18,
    'WETH',
    'Wrapped Ether',
    'https://weth.io'
  )
}

/** Wrapped native in binance  */
export const WBNB = {
  [ChainId.BSC_TESTNET]: new ERC20Token(ChainId.BSC_TESTNET, '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd', 18, 'WBNB', 'Wrapped BNB', 'https://www.binance.org')
}

/**
 * TODO: Chưa có địa chỉ WMON ngoại trừ trên mạng mon testnet
 * TODO: AMOY_POLYGON cũng chưa có W
 */

/** Wrapped native in mon  */
export const WMON = {
  [ChainId.MON_TESTNET]: new ERC20Token(ChainId.MON_TESTNET, '0xBbDc62F288da79D0195f219cd4AF0a1a6906935F', 18, 'WMON', 'Wrapped MON', '')
}

/**
 * TODO: AMOY_POLYGON cũng chưa tìm được địa chỉ của WMATIC
 */
export const WNATIVE = {
  [ChainId.BSC_TESTNET]: WBNB[ChainId.BSC_TESTNET],
  [ChainId.MON_TESTNET]: WMON[ChainId.MON_TESTNET],
  [ChainId.SEPOLIA]: WETH9[ChainId.SEPOLIA],
  [ChainId.AMOY_POLYGON]: WPOL[ChainId.AMOY_POLYGON],
  [ChainId.ARBITRUM_SEPOLIA]: WETH9[ChainId.ARBITRUM_SEPOLIA]
} as Record<ChainId, ERC20Token>

export const NATIVE = {
  [ChainId.BSC_TESTNET]: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  [ChainId.MON_TESTNET]: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18
  },
  [ChainId.SEPOLIA]: {
    name: 'Sepolia Ether',
    symbol: 'SEP',
    decimals: 18
  },
  [ChainId.AMOY_POLYGON]: {
    name: 'Polygon',
    symbol: 'POL',
    decimals: 18
  },
  [ChainId.ARBITRUM_SEPOLIA]: {
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
    decimals: 18
  }
} satisfies Record<
  ChainId,
  {
    name: string
    symbol: string
    decimals: number
  }
>
