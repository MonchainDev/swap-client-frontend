import { FeeAmount } from '@monchain/v3-sdk'
import type { Address } from 'viem'

export const FEE_ALLOWANCE = [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH]

export const FACTORY_ADDRESS = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'

const FACTORY_ADDRESS_ETH = '0x1097053Fd2ea711dad45caCcc45EfF7548fCB362'

/**
 * Enumeration of supported blockchain network chain IDs.
 *
 * @enum {number}
 * @readonly
 *
 * @property {number} ETHEREUM - Mainnet Ethereum chain ID.
 * @property {number} GOERLI - Goerli testnet chain ID.
 * @property {number} BSC - Binance Smart Chain mainnet chain ID.
 * @property {number} BSC_TESTNET - Binance Smart Chain testnet chain ID.
 * @property {number} ZKSYNC_TESTNET - zkSync testnet chain ID.
 * @property {number} ZKSYNC - zkSync mainnet chain ID.
 * @property {number} OPBNB_TESTNET - opBNB testnet chain ID.
 * @property {number} OPBNB - opBNB mainnet chain ID.
 * @property {number} POLYGON_ZKEVM - Polygon zkEVM mainnet chain ID.
 * @property {number} POLYGON_ZKEVM_TESTNET - Polygon zkEVM testnet chain ID.
 * @property {number} ARBITRUM_ONE - Arbitrum One mainnet chain ID.
 * @property {number} ARBITRUM_GOERLI - Arbitrum Goerli testnet chain ID.
 * @property {number} ARBITRUM_SEPOLIA - Arbitrum Sepolia testnet chain ID.
 * @property {number} SCROLL_SEPOLIA - Scroll Sepolia testnet chain ID.
 * @property {number} LINEA - Linea mainnet chain ID.
 * @property {number} LINEA_TESTNET - Linea testnet chain ID.
 * @property {number} BASE - Base mainnet chain ID.
 * @property {number} BASE_TESTNET - Base testnet chain ID.
 * @property {number} BASE_SEPOLIA - Base Sepolia testnet chain ID.
 * @property {number} SEPOLIA - Sepolia testnet chain ID.
 * @property {number} MONCHAIN - Monchain mainnet chain ID.
 */
// export declare enum ChainId {
//     ETHEREUM = 1,
//     GOERLI = 5,
//     BSC = 56,
//     BSC_TESTNET = 97,
//     ZKSYNC_TESTNET = 280,
//     ZKSYNC = 324,
//     OPBNB_TESTNET = 5611,
//     OPBNB = 204,
//     POLYGON_ZKEVM = 1101,
//     POLYGON_ZKEVM_TESTNET = 1442,
//     ARBITRUM_ONE = 42161,
//     ARBITRUM_GOERLI = 421613,
//     ARBITRUM_SEPOLIA = 421614,
//     SCROLL_SEPOLIA = 534351,
//     LINEA = 59144,
//     LINEA_TESTNET = 59140,
//     BASE = 8453,
//     BASE_TESTNET = 84531,
//     BASE_SEPOLIA = 84532,
//     SEPOLIA = 11155111,
//     MONCHAIN = 16789
// }

// export const FACTORY_ADDRESS_MAP = {
//     [ChainId.ETHEREUM]: FACTORY_ADDRESS_ETH,
//     [ChainId.GOERLI]: FACTORY_ADDRESS_ETH,
//     [ChainId.BSC]: FACTORY_ADDRESS,
//     [ChainId.BSC_TESTNET]: '0x6725F303b657a9451d8BA641348b6761A6CC7a17',
//     [ChainId.ARBITRUM_ONE]: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
//     [ChainId.ARBITRUM_GOERLI]: '0x333EAE459075b1d7dE8eb57997b5d4eee5F1070a',
//     [ChainId.POLYGON_ZKEVM]: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
//     [ChainId.POLYGON_ZKEVM_TESTNET]: '0xBA40c83026213F9cbc79998752721a0312bdB74a',
//     [ChainId.ZKSYNC]: '0xd03D8D566183F0086d8D09A84E1e30b58Dd5619d',
//     [ChainId.ZKSYNC_TESTNET]: '0x48a33610Cd0E130af2024D55F67aE72a8C51aC27',
//     [ChainId.LINEA]: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
//     [ChainId.LINEA_TESTNET]: '0xB6FAfd4ADbCd21cF665909767e0eD0D05709abfB',
//     [ChainId.OPBNB]: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
//     [ChainId.OPBNB_TESTNET]: '0x776e4bD2f72de2176A59465e316335aaf8ed4E8F',
//     [ChainId.BASE]: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
//     [ChainId.BASE_TESTNET]: '0x715303D2eF7dA7FFAbF637651D71FD11d41fAf7F',
//     [ChainId.SCROLL_SEPOLIA]: '0x2B3C5df29F73dbF028BA82C33e0A5A6e5800F75e',
//     [ChainId.SEPOLIA]: '0x1bdc540dEB9Ed1fA29964DeEcCc524A8f5e2198e',
//     [ChainId.ARBITRUM_SEPOLIA]: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
//     [ChainId.BASE_SEPOLIA]: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
//     [ChainId.MONCHAIN]: '0xF04f6ACf17C9e884D5eBE4aa6804cFD16CdEe32B',
// } as const satisfies Record<ChainId, Address>
