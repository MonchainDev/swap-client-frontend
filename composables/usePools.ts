import type { BigintIsh, Currency, Token } from '@monchain/swap-sdk-core'
import type { FeeAmount } from '@monchain/v3-sdk'
import { Pool } from '@monchain/v3-sdk'
import { useAccount, useReadContract } from '@wagmi/vue'
import type { Address } from 'viem'
import v3PoolStateABI from '~/constant/abi/v3PoolStateABI.json'
import { CONTRACT_ADDRESS } from '~/constant/contract'

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

export default function usePools() {
  const { feeAmount, baseCurrency, quoteCurrency } = storeToRefs(useLiquidityStore())

  const { chainId } = useAccount()

  const poolKeys = computed((): [Currency | undefined | null, Currency | undefined | null, FeeAmount | undefined][] => {
    return [[baseCurrency.value, quoteCurrency.value, feeAmount.value]]
  })

  const poolTokens = computed((): ([Token, Token, FeeAmount] | undefined)[] => {
    if (!chainId.value) return new Array(poolKeys.value.length)

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

  const poolAddresses = computed(() => {
    const v3CoreDeployerAddress = chainId.value && (CONTRACT_ADDRESS.DEPLOYER_ADDRESSES as `0x${string}`)
    if (!v3CoreDeployerAddress) return new Array(poolTokens.value.length)
    return poolTokens.value.map((value) => value && PoolCache.getPoolAddress(v3CoreDeployerAddress, ...value))
  })

  const { data: slot0s } = useReadContract(
    computed(() => ({
      abi: v3PoolStateABI,
      address: poolAddresses.value[0],
      functionName: 'slot0'
    }))
  )
  const { data: liquidities } = useReadContract(
    computed(() => ({
      abi: v3PoolStateABI,
      address: poolAddresses.value[0],
      functionName: 'liquidity'
    }))
  )

  const pool = ref<Pool | undefined>(undefined)
  const poolExits = computed(() => Boolean(pool.value))

  watchEffect(() => {
    if (liquidities.value && slot0s.value) {
      const tokens = poolTokens.value[0]
      if (tokens?.length) {
        const [token0, token1, fee] = tokens
        const [sqrtPriceX96, tick, , , , feeProtocol] = slot0s.value as [bigint, number, number, number, number, number]
        const _pool = new Pool(token0, token1, fee, sqrtPriceX96, liquidities.value as bigint, tick)
        _pool.feeProtocol = feeProtocol
        pool.value = _pool
      } else {
        pool.value = undefined
      }
    } else {
      pool.value = undefined
    }
  })

  return { poolAddresses, poolTokens, poolKeys, chainId, slot0s, liquidities, pool, poolExits }
}
