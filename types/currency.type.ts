import type { ERC20Token } from '@monchain/sdk'
import type { Currency } from '@monchain/swap-sdk-core'

export type UnsafeCurrency = Currency | ERC20Token | null | undefined
