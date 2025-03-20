import { ERC20Token } from '@monchain/swap-sdk-evm'
import { ChainId } from '~/types'

export const WMON = {
  [ChainId.BSC_TESTNET]: new ERC20Token(ChainId.BSC_TESTNET, '0xf9012437655f666bcb07f50cc471f531629342df', 18, 'WMON', 'Wrapped MON', ''),
  [ChainId.MON_TESTNET]: new ERC20Token(ChainId.MON_TESTNET, '0xf9012437655f666bcb07f50cc471f531629342df', 18, 'WMON', 'Wrapped MON', ''),
  [ChainId.SEPOLIA]: new ERC20Token(ChainId.SEPOLIA, '0xf9012437655f666bcb07f50cc471f531629342df', 18, 'WMON', 'Wrapped MON', ''),
  [ChainId.AMOY_POLYGON]: new ERC20Token(ChainId.AMOY_POLYGON, '0xf9012437655f666bcb07f50cc471f531629342df', 18, 'WMON', 'Wrapped MON', ''),
  [ChainId.ARBITRUM_SEPOLIA]: new ERC20Token(ChainId.ARBITRUM_SEPOLIA, '0xf9012437655f666bcb07f50cc471f531629342df', 18, 'WMON', 'Wrapped MON', '')
}

export const WNATIVE = {
  [ChainId.BSC_TESTNET]: WMON[ChainId.BSC_TESTNET],
  [ChainId.MON_TESTNET]: WMON[ChainId.MON_TESTNET],
  [ChainId.SEPOLIA]: WMON[ChainId.SEPOLIA],
  [ChainId.AMOY_POLYGON]: WMON[ChainId.AMOY_POLYGON],
  [ChainId.ARBITRUM_SEPOLIA]: WMON[ChainId.ARBITRUM_SEPOLIA]
} as Record<ChainId, ERC20Token>

export const NATIVE = {
  [ChainId.BSC_TESTNET]: {
    name: 'Binance Chain Native Token',
    symbol: 'tBNB',
    decimals: 18
  },
  [ChainId.MON_TESTNET]: {
    name: 'Mon Chain Native Token',
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
