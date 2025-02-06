import type { INetwork, IToken } from '~/types'

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
    value: 'BNB'
  },
  {
    title: 'Ethereum',
    logo: '/logo-ethereum-chain.png',
    value: 'ETH'
  },
  {
    title: 'Polygon',
    logo: '/logo-polygon-chain.png',
    value: 'MATIC'
  },
  {
    title: 'Mon chain',
    logo: '/logo-mon-chain.png',
    value: 'MON'
  },
  {
    title: 'Liena chain',
    logo: '/logo-liena-chain.png',
    value: 'LIENA'
  }
]

export { DEFAULT_SLIPPAGE, DECIMALS_NATIVE, NATIVE_TOKEN, WRAPPED_NATIVE_TOKEN, LIST_NETWORK }
