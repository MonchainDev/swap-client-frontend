import invariant from 'tiny-invariant'

import { Price } from '@monchain/sdk'
import type { V3Pool } from '@monchain/smart-router'
import { type Currency as TokenCurrency } from '@monchain/sdk'

/**
 * Represents a list of pools through which a swap can occur
 * @template TInput The input token
 * @template TOutput The output token
 */
export class RouteV3<TInput extends TokenCurrency, TOutput extends TokenCurrency> {
  public readonly pools: V3Pool[]

  public readonly tokenPath: TokenCurrency[]

  public readonly input: TInput

  public readonly output: TOutput

  private _midPrice: Price<TInput, TOutput> | null = null

  /**
   * Creates an instance of route.
   * @param pools An array of `Pool` objects, ordered by the route the swap will take
   * @param input The input token
   * @param output The output token
   */
  public constructor(pools: V3Pool[], input: TInput, output: TOutput) {
    invariant(pools.length > 0, 'POOLS')

    const wrappedInput = input.wrapped

    /**
     * Normalizes token0-token1 order and selects the next token/fee step to add to the path
     * */
    const tokenPath: TokenCurrency[] = [wrappedInput]
    for (const [i, pool] of pools.entries()) {
      const currentInputToken = tokenPath[i]
      invariant(currentInputToken.equals(pool.token0) || currentInputToken.equals(pool.token1), 'PATH')
      const nextToken = currentInputToken.equals(pool.token0) ? pool.token1 : pool.token0
      tokenPath.push(nextToken)
    }

    this.pools = pools
    this.tokenPath = tokenPath
    this.input = input
    // @ts-ignore
    this.output = output ?? tokenPath[tokenPath.length - 1]
  }

  /**
   * Returns the mid price of the route
   */
  public get midPrice(): Price<TInput, TOutput> {
    if (this._midPrice !== null) return this._midPrice

    const token0Price0 = this.token0Price(this.pools[0]) // TODO: lay tu pool0
    const token1Price0 = this.token1Price(this.pools[0]) // TODO:

    const { price } = this.pools.slice(1).reduce(
      ({ nextInput, price }, pool) => {
        const token0Price = this.token0Price(pool) // TODO: lay tu pool0
        const token1Price = this.token1Price(pool) // TODO:
        return nextInput.equals(pool.token0)
          ? {
              nextInput: pool.token1,
              price: price.multiply(token0Price)
            }
          : {
              nextInput: pool.token0,
              price: price.multiply(token1Price)
            }
      },

      this.pools[0].token0.equals(this.input.wrapped)
        ? {
            nextInput: this.pools[0].token1,
            price: token0Price0
          }
        : {
            nextInput: this.pools[0].token0,
            price: token1Price0
          }
    )

    return (this._midPrice = new Price(this.input, this.output, price.denominator, price.numerator))
  }

  public token0Price(pool: V3Pool): Price<TokenCurrency, TokenCurrency> {
    return new Price(pool.token0, pool.token1, Q192, pool.sqrtRatioX96 * pool.sqrtRatioX96)
  }

  /**
   * Returns the current mid price of the pool in terms of token1, i.e. the ratio of token0 over token1
   */
  public token1Price(pool: V3Pool): Price<TokenCurrency, TokenCurrency> {
    return new Price(pool.token1, pool.token0, pool.sqrtRatioX96 * pool.sqrtRatioX96, Q192)
  }
}
