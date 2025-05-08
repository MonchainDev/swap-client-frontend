import type { ERC20Token } from '@wicchain/sdk'
import type { Currency } from '@wicchain/swap-sdk-core'

export type UnsafeCurrency = Currency | ERC20Token | null | undefined
