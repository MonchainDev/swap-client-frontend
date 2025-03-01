import type { Currency } from '@monchain/swap-sdk-core'
import type { FeeAmount } from '@monchain/v3-sdk'

export default function usePoolsWithMultiChains(poolKeys: [Currency | undefined | number][][]) {
  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped
        if (tokenA.equals(tokenB)) return undefined

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount]
      }
      return undefined
    })
  }, [poolKeys])

  const poolAddressMap: { [chainId: number]: Address[] } = useMemo(() => {
    return poolTokens.reduce((acc, value) => {
      if (!value) {
        return acc
      }
      const { chainId } = value[0]
      const v3CoreDeployerAddress = DEPLOYER_ADDRESSES[chainId]
      const addr = PoolCache.getPoolAddress(v3CoreDeployerAddress, ...value)

      acc[chainId] = acc[chainId] ?? []
      acc[chainId].push(addr)
      return acc
    }, {})
  }, [poolTokens])

  const chainIds = useMemo(() => Object.keys(poolAddressMap), [poolAddressMap])
  const poolAddressesString = useMemo(() => chainIds.flatMap((chainId) => poolAddressMap[chainId]).join(','), [chainIds, poolAddressMap])

  const { data: poolInfoByChainId } = useQuery({
    queryKey: ['v3PoolInfo', chainIds.join(','), poolAddressesString],
    queryFn: async () => {
      const results = await Promise.all(
        chainIds.map(async (chainId) => {
          const poolAddresses: Address[] = poolAddressMap[chainId]
          const client = publicClient({ chainId: Number(chainId) })

          const slot0Calls = poolAddresses.map((addr) => ({
            address: addr,
            abi: v3PoolStateABI,
            functionName: 'slot0'
          }))

          const liquidityCalls = poolAddresses.map((addr) => ({
            address: addr,
            abi: v3PoolStateABI,
            functionName: 'liquidity'
          }))

          try {
            const [slot0Data, liquidityData] = await Promise.all([
              client.multicall({
                contracts: slot0Calls,
                allowFailure: false
              }),
              client.multicall({
                contracts: liquidityCalls,
                allowFailure: false
              })
            ])

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

          acc[chainId] = result[chainId]
          return acc
        },
        {} as { slot0: [bigint, number, number, number, number, number, boolean]; liquidity: [bigint, number, number, number, number, number, boolean] }
      )
    },
    enabled: chainIds?.length > 0,
    placeholderData: keepPreviousData,
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH
  })

  return useMemo(() => {
    const indexMap = {}
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index]
      if (!tokens) return [PoolState.INVALID, null]
      const [token0, token1, fee] = tokens

      indexMap[token0.chainId] = (indexMap[token0.chainId] ?? -1) + 1
      const { slot0: slot0s = [], liquidity: liquidities = [] } = poolInfoByChainId?.[token0.chainId] || {}
      const slot0 = slot0s[indexMap[token0.chainId]]
      const liquidity = liquidities[indexMap[token0.chainId]]
      if (typeof slot0 === 'undefined' || typeof liquidity === 'undefined') return [PoolState.INVALID, null]
      const [sqrtPriceX96, tick, , , , feeProtocol] = slot0
      if (!sqrtPriceX96 || sqrtPriceX96 === 0n) return [PoolState.NOT_EXISTS, null]

      try {
        const pool = PoolCache.getPool(token0, token1, fee, sqrtPriceX96, liquidity, tick, feeProtocol)
        return [PoolState.EXISTS, pool]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [poolKeys, poolTokens, poolInfoByChainId])
}
