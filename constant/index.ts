import type { IToken } from '~/types'

const DEFAULT_SLIPPAGE = 5.5
const BASE_URL_API = 'https://dev.blockscout.hdev99.io.vn/'
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

export { DEFAULT_SLIPPAGE, BASE_URL_API, DECIMALS_NATIVE, NATIVE_TOKEN, WRAPPED_NATIVE_TOKEN }
