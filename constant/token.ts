import { ERC20Token } from '@monchain/swap-sdk-evm'
import { ChainId } from '~/types'

export const WMON = {
  [ChainId.BSC_TESTNET]: new ERC20Token(
    ChainId.BSC_TESTNET,
    '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org'
  ),
  [ChainId.MON_TESTNET]: new ERC20Token(ChainId.MON_TESTNET, '0xF9012437655F666bcB07f50Cc471f531629342Df', 18, 'WMON', 'Wrapped MON', '')
}

export const WNATIVE = {
  [ChainId.BSC_TESTNET]: WMON[ChainId.BSC_TESTNET],
  [ChainId.MON_TESTNET]: WMON[ChainId.MON_TESTNET]
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
  }
} satisfies Record<
  ChainId,
  {
    name: string
    symbol: string
    decimals: number
  }
>
