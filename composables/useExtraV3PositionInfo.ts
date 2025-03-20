import type { BigintIsh, Currency, Token } from '@monchain/swap-sdk-core'
import { nearestUsableTick, Pool, Position, TICK_SPACINGS, TickMath, type FeeAmount } from '@monchain/v3-sdk'
import { useQuery } from '@tanstack/vue-query'
import type { Address } from 'viem'
import v3PoolStateABI from '~/constant/abi/v3PoolStateABI.json'
import { WNATIVE } from '~/constant/token'
import { Bound, type PositionDetail } from '~/types'

// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: Pool[] = []

  private static addresses: { key: string; address: string }[] = []

  static getPoolAddress(deployerAddress: Address, tokenA: Token, tokenB: Token, fee: FeeAmount): Address {
    if (this.addresses.length > this.MAX_ENTRIES) {
      this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2)
    }

    const { address: addressA } = tokenA
    const { address: addressB } = tokenB
    const key = `${deployerAddress}:${addressA}:${addressB}:${fee.toString()}`

    const found = this.addresses.find((address) => address.key === key)
    if (found) return found.address as Address

    const address = {
      key,
      address: computePoolAddress({
        deployerAddress,
        tokenA,
        tokenB,
        fee
      })
    }

    this.addresses.unshift(address)
    return address.address
  }

  static getPool(tokenA: Token, tokenB: Token, fee: FeeAmount, sqrtPriceX96: BigintIsh, liquidity: BigintIsh, tick: number, feeProtocol?: number): Pool {
    if (this.pools.length > this.MAX_ENTRIES) {
      this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2)
    }

    const found = this.pools.find(
      (pool) =>
        pool.token0 === tokenA &&
        pool.token1 === tokenB &&
        pool.fee === fee &&
        pool.sqrtRatioX96 === sqrtPriceX96 &&
        pool.liquidity === liquidity &&
        pool.tickCurrent === tick
    )
    if (found) return found

    const pool = new Pool(tokenA, tokenB, fee, sqrtPriceX96, liquidity, tick)
    pool.feeProtocol = feeProtocol
    this.pools.unshift(pool)
    return pool
  }
}

export function unwrappedToken(token?: Token): Currency | undefined {
  if (token && token.equals(WNATIVE[token.chainId as keyof typeof WNATIVE])) {
    return Native.onChain(token.chainId)
  }
  return token
}

export default function useExtraV3PositionInfo(positionDetail: PositionDetail) {
  const chainId = positionDetail?.chainId

  const { token: token0 } = useTokenByChainId(positionDetail.token0, chainId)
  const { token: token1 } = useTokenByChainId(positionDetail.token1, chainId)

  const currency0 = computed(() => unwrappedToken(token0.value))
  const currency1 = computed(() => unwrappedToken(token1.value))

  const poolKeys = computed((): [Currency | undefined | null, Currency | undefined | null, FeeAmount | undefined][] => [
    [currency0.value, currency1.value, positionDetail.fee]
  ])

  const poolTokens = computed((): ([Token, Token, FeeAmount] | undefined)[] => {
    return poolKeys.value.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped
        if (tokenA.equals(tokenB)) return undefined

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount]
      }
      return undefined
    })
  })

  const poolAddressMap = computed((): { [chainId: number]: Address[] } => {
    return poolTokens.value.reduce((acc: { [chainId: number]: Address[] }, value) => {
      if (!value) {
        return acc
      }
      const { chainId } = value[0]
      const v3CoreDeployerAddress = getV3PoolDeployerAddress(chainId) ?? '0x'
      const addr = PoolCache.getPoolAddress(v3CoreDeployerAddress, ...value)

      acc[chainId] = acc[chainId] ?? []
      acc[chainId].push(addr)
      return acc
    }, {})
  })

  const chainIds = computed(() => Object.keys(poolAddressMap.value))

  const poolAddressesString = computed(() => chainIds.value.flatMap((chainId) => poolAddressMap.value[+chainId]).join(','))

  const queryKey = computed(() => ['v3PoolInfo', chainIds.value, poolAddressesString.value])

  const { data: poolInfoByChainId } = useQuery({
    queryKey: queryKey.value,
    queryFn: async () => {
      const results = await Promise.all(
        chainIds.value.map(async (chainId) => {
          const poolAddresses: Address[] = poolAddressMap.value[+chainId]

          const client = publicClient({ chainId: Number(chainId) })

          try {
            const slot0CallsPromises = poolAddresses.map((addr) =>
              client.readContract({
                address: addr,
                abi: v3PoolStateABI,
                functionName: 'slot0'
              })
            )

            const liquidityCallsPromises = poolAddresses.map((addr) =>
              client.readContract({
                address: addr,
                abi: v3PoolStateABI,
                functionName: 'liquidity'
              })
            )

            const [slot0Data, liquidityData] = await Promise.all([Promise.all(slot0CallsPromises), Promise.all(liquidityCallsPromises)])

            return { [chainId]: { slot0: slot0Data, liquidity: liquidityData } }
          } catch (error) {
            console.error(`Error fetching data for chainId ${chainId}:`, error)
            return { [chainId]: { slot0: undefined, liquidity: undefined } }
          }
        })
      )

      return results.reduce(
        (acc, result) => {
          const chainId = Object.keys(result)[0]
          //@ts-ignore
          acc[chainId] = result[chainId]
          return acc
        },
        {} as {
          [key: number]: {
            slot0: [bigint, number, number, number, number, number, boolean][]
            liquidity: [bigint, number, number, number, number, number, boolean][]
          }
        }
      )
    },
    enabled: computed(() => chainIds.value.length > 0 && poolAddressesString.value.length > 0),
    retry: 3,
    retryDelay: 3000
    // placeholderData: keepPreviousData
  })

  const pool = computed(() => {
    const indexMap: Record<string, number> = {}
    return poolKeys.value.map((_key, index) => {
      const tokens = poolTokens.value[index]
      if (!tokens) return null
      const [token0, token1, fee] = tokens

      indexMap[token0.chainId] = (indexMap[token0.chainId] ?? -1) + 1
      const { slot0: slot0s = [], liquidity: liquidities = [] } = poolInfoByChainId.value?.[token0.chainId] || {}
      const slot0 = slot0s[indexMap[token0.chainId]]
      const liquidity = liquidities[indexMap[token0.chainId]]
      if (typeof slot0 === 'undefined' || typeof liquidity === 'undefined') return null
      const [sqrtPriceX96, tick, , , , feeProtocol] = slot0 as [bigint, number, number, number, number, number, boolean]
      if (!sqrtPriceX96 || sqrtPriceX96 === 0n) return null

      try {
        const pool = PoolCache.getPool(token0, token1, fee, sqrtPriceX96, liquidity as bigint, tick, feeProtocol)
        return pool
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return null
      }
    })
  })

  const position = computed(() => {
    if (pool.value && pool.value[0] && positionDetail) {
      return new Position({
        pool: pool.value[0],
        liquidity: positionDetail.liquidity.toString(),
        tickLower: positionDetail.tickLower,
        tickUpper: positionDetail.tickUpper
      })
    }
    return undefined
  })

  const tickAtLimit = computed(() => {
    if (positionDetail) {
      const { fee: feeAmount, tickLower, tickUpper } = positionDetail
      return {
        [Bound.LOWER]: feeAmount && tickLower ? tickLower === nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount as FeeAmount]) : undefined,
        [Bound.UPPER]: feeAmount && tickUpper ? tickUpper === nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount as FeeAmount]) : undefined
      }
    }
    return undefined
  })

  const formattedPool = computed(() => {
    return pool.value && pool.value[0]
  })

  const outOfRange = computed(() => {
    return formattedPool.value && positionDetail
      ? formattedPool.value.tickCurrent < positionDetail.tickLower || formattedPool.value.tickCurrent >= positionDetail.tickUpper
      : false
  })

  const removed = computed(() => {
    return positionDetail ? positionDetail.liquidity === 0n : false
  })

  const price = computed(() => {
    return formattedPool && token0.value ? formattedPool.value?.priceOf(token0.value) : undefined
  })

  const priceFromPosition = computed(() => {
    return getPriceOrderingFromPositionForUI(position.value)
  })

  const priceLower = computed(() => priceFromPosition.value.priceLower)
  const priceUpper = computed(() => priceFromPosition.value.priceUpper)
  const quote = computed(() => priceFromPosition.value.quote)
  const base = computed(() => priceFromPosition.value.base)

  return { currency0, currency1, position, pool, formattedPool, tickAtLimit, outOfRange, removed, price, priceLower, priceUpper, quote, base }
}
