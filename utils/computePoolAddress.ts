import type { Token } from '@pancakeswap/swap-sdk-core'
import type { FeeAmount } from '@pancakeswap/v3-sdk'
import {
  concat,
  encodeAbiParameters,
  getAddress,
  isBytes,
  keccak256,
  pad,
  parseAbiParameters,
  slice,
  toBytes,
  type Address,
  type ByteArray,
  type GetCreate2AddressOptions,
  type Hash,
  type Hex
} from 'viem'

const POOL_INIT_CODE_HASH = '0xec014d553cf8e227ff815e13561fc490e9f91efce2d91baf2293cbd6a7ba98cb' as `0x${string}`

export function computePoolAddress({
  deployerAddress,
  tokenA,
  tokenB,
  fee,
  initCodeHashManualOverride
}: {
  deployerAddress: Address
  tokenA: Token
  tokenB: Token
  fee: FeeAmount
  initCodeHashManualOverride?: Hash
}): Address {
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks

  const salt = keccak256(encodeAbiParameters(parseAbiParameters(['address, address, uint24']), [token0.address, token1.address, fee]))

  return getCreate2Address(deployerAddress, salt, initCodeHashManualOverride ?? POOL_INIT_CODE_HASH)
}

function getCreate2Address(from_: GetCreate2AddressOptions['from'], salt_: GetCreate2AddressOptions['salt'], initCodeHash: Hex) {
  const from = toBytes(getAddress(from_))
  const salt = pad(isBytes(salt_) ? salt_ : toBytes(salt_ as Hex), {
    size: 32
  }) as ByteArray

  return getAddress(slice(keccak256(concat([toBytes('0xff'), from, salt, toBytes(initCodeHash)])), 12))
}
