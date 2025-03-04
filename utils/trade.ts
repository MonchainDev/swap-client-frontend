import {
    Fraction,
    Percent,
    Price,
    sortedInsert,
    CurrencyAmount,
    TradeType,
    InsufficientInputAmountError,
    InsufficientReservesError,
    type Currency as TokenCurrency,
} from '@monchain/sdk'

import {
    FeeAmount,
    TickListDataProvider,
    LiquidityMath,
    SwapMath,
    TickMath,
    TICK_SPACINGS, Pool as PoolOld,

} from '@monchain/v3-sdk'

import invariant from 'tiny-invariant'
import {PoolType, type V3Pool} from "@monchain/smart-router";
import {RouteV3} from "./routeV3";

// constants used internally but not expected to be used externally
export const NEGATIVE_ONE = BigInt(-1)
export const ZERO = 0n
export const ONE = 1n

// used in liquidity amount math
export const Q96 = 2n ** 96n
export const Q192 = Q96 ** 2n

// used in fee calculation
export const MAX_FEE = 10n ** 6n
export const ONE_HUNDRED_PERCENT = new Percent('1')
export const ZERO_PERCENT = new Percent('0')
export const Q128 = 2n ** 128n

interface StepComputations {
    sqrtPriceStartX96: bigint
    tickNext: number
    initialized: boolean
    sqrtPriceNextX96: bigint
    amountIn: bigint
    amountOut: bigint
    feeAmount: bigint
}

/**
 * Trades comparator, an extension of the input output comparator that also considers other dimensions of the trade in ranking them
 * @template TInput The input token, either Ether or an ERC-20
 * @template TOutput The output token, either Ether or an ERC-20
 * @template TTradeType The trade type, either exact input or exact output
 * @param a The first trade to compare
 * @param b The second trade to compare
 * @returns A sorted ordering for two neighboring elements in a trade array
 */
export function tradeComparator<TInput extends TokenCurrency, TOutput extends TokenCurrency, TTradeType extends TradeType>(
    a: Trade<TInput, TOutput, TTradeType>,
    b: Trade<TInput, TOutput, TTradeType>
) {
    // must have same input and output token for comparison
    invariant(a.inputAmount.currency.equals(b.inputAmount.currency), 'INPUT_CURRENCY')
    invariant(a.outputAmount.currency.equals(b.outputAmount.currency), 'OUTPUT_CURRENCY')
    if (a.outputAmount.equalTo(b.outputAmount)) {
        if (a.inputAmount.equalTo(b.inputAmount)) {
            // consider the number of hops since each hop costs gas
            const aHops = a.swaps.reduce((total, cur) => total + cur.route.tokenPath.length, 0)
            const bHops = b.swaps.reduce((total, cur) => total + cur.route.tokenPath.length, 0)
            return aHops - bHops
        }
        // trade A requires less input than trade B, so A should come first
        if (a.inputAmount.lessThan(b.inputAmount)) {
            return -1
        }
        return 1
    }
    // tradeA has less output than trade B, so should come second
    if (a.outputAmount.lessThan(b.outputAmount)) {
        return 1
    }
    return -1
}

export interface BestTradeOptions {
    // how many results to return
    maxNumResults?: number
    // the maximum number of hops a trade should contain
    maxHops?: number
}

/**
 * Represents a trade executed against a set of routes where some percentage of the input is
 * split across each route.
 *
 * Each route has its own set of pools. Pools can not be re-used across routes.
 *
 * Does not account for slippage, i.e., changes in price environment that can occur between
 * the time the trade is submitted and when it is executed.
 * @template TInput The input token, either Ether or an ERC-20
 * @template TOutput The output token, either Ether or an ERC-20
 * @template TTradeType The trade type, either exact input or exact output
 */
export class Trade<TInput extends TokenCurrency, TOutput extends TokenCurrency, TTradeType extends TradeType> {
    /**
     * @deprecated Deprecated in favor of 'swaps' property. If the trade consists of multiple routes
     * this will return an error.
     *
     * When the trade consists of just a single route, this returns the route of the trade,
     * i.e. which pools the trade goes through.
     */
    public get route(): RouteV3<TInput, TOutput> {
        invariant(this.swaps.length == 1, 'MULTIPLE_ROUTES')
        return this.swaps[0].route
    }

    /**
     * The swaps of the trade, i.e. which routes and how much is swapped in each that
     * make up the trade.
     */
    public readonly swaps: {
        route: RouteV3<TInput, TOutput>
        inputAmount: CurrencyAmount<TInput>
        outputAmount: CurrencyAmount<TOutput>
    }[]

    /**
     * The type of the trade, either exact in or exact out.
     */
    public readonly tradeType: TTradeType

    /**
     * The cached result of the input amount computation
     * @private
     */
    private _inputAmount: CurrencyAmount<TInput> | undefined

    /**
     * The input amount for the trade assuming no slippage.
     */
    public get inputAmount(): CurrencyAmount<TInput> {
        if (this._inputAmount) {
            return this._inputAmount
        }

        const inputCurrency = this.swaps[0].inputAmount.currency
        const totalInputFromRoutes = this.swaps
            .map(({ inputAmount }) => inputAmount)
            .reduce((total, cur) => total.add(cur), CurrencyAmount.fromRawAmount(inputCurrency, 0))

        this._inputAmount = totalInputFromRoutes
        return this._inputAmount
    }

    /**
     * The cached result of the output amount computation
     * @private
     */
    private _outputAmount: CurrencyAmount<TOutput> | undefined

    /**
     * The output amount for the trade assuming no slippage.
     */
    public get outputAmount(): CurrencyAmount<TOutput> {
        if (this._outputAmount) {
            return this._outputAmount
        }

        const outputCurrency = this.swaps[0].outputAmount.currency
        const totalOutputFromRoutes = this.swaps
            .map(({ outputAmount }) => outputAmount)
            .reduce((total, cur) => total.add(cur), CurrencyAmount.fromRawAmount(outputCurrency, 0))

        this._outputAmount = totalOutputFromRoutes
        return this._outputAmount
    }

    /**
     * The cached result of the computed execution price
     * @private
     */
    private _executionPrice: Price<TInput, TOutput> | undefined

    /**
     * The price expressed in terms of output amount/input amount.
     */
    public get executionPrice(): Price<TInput, TOutput> {
        return (
            this._executionPrice ??
            (this._executionPrice = new Price(
                this.inputAmount.currency,
                this.outputAmount.currency,
                this.inputAmount.quotient,
                this.outputAmount.quotient
            ))
        )
    }

    /**
     * The cached result of the price impact computation
     * @private
     */
    private _priceImpact: Percent | undefined

    /**
     * Returns the percent difference between the route's mid price and the price impact
     */
    public get priceImpact(): Percent {
        if (this._priceImpact) {
            return this._priceImpact
        }

        let spotOutputAmount = CurrencyAmount.fromRawAmount(this.outputAmount.currency, 0)
        for (const { route, inputAmount } of this.swaps) {
            const { midPrice } = route
            spotOutputAmount = spotOutputAmount.add(midPrice.quote(inputAmount))
        }

        const priceImpact = spotOutputAmount.subtract(this.outputAmount).divide(spotOutputAmount)
        this._priceImpact = new Percent(priceImpact.numerator, priceImpact.denominator)

        return this._priceImpact
    }

    /**
     * Constructs an exact in trade with the given amount in and route
     * @template TInput The input token, either Ether or an ERC-20
     * @template TOutput The output token, either Ether or an ERC-20
     * @param route The route of the exact in trade
     * @param amountIn The amount being passed in
     * @returns The exact in trade
     */
    public static async exactIn<TInput extends TokenCurrency, TOutput extends TokenCurrency>(
        route: RouteV3<TInput, TOutput>,
        amountIn: CurrencyAmount<TInput>
    ): Promise<Trade<TInput, TOutput, TradeType.EXACT_INPUT>> {
        return Trade.fromRoute(route, amountIn, TradeType.EXACT_INPUT)
    }

    /**
     * Constructs an exact out trade with the given amount out and route
     * @template TInput The input token, either Ether or an ERC-20
     * @template TOutput The output token, either Ether or an ERC-20
     * @param route The route of the exact out trade
     * @param amountOut The amount returned by the trade
     * @returns The exact out trade
     */
    public static async exactOut<TInput extends TokenCurrency, TOutput extends TokenCurrency>(
        route: RouteV3<TInput, TOutput>,
        amountOut: CurrencyAmount<TOutput>
    ): Promise<Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>> {
        return Trade.fromRoute(route, amountOut, TradeType.EXACT_OUTPUT)
    }

    /**
     * Constructs a trade by simulating swaps through the given route
     * @template TInput The input token, either Ether or an ERC-20.
     * @template TOutput The output token, either Ether or an ERC-20.
     * @template TTradeType The type of the trade, either exact in or exact out.
     * @param route route to swap through
     * @param amount the amount specified, either input or output, depending on tradeType
     * @param tradeType whether the trade is an exact input or exact output swap
     * @returns The route
     */
    public static async fromRoute<TInput extends TokenCurrency, TOutput extends TokenCurrency, TTradeType extends TradeType>(
        route: RouteV3<TInput, TOutput>,
        amount: TTradeType extends TradeType.EXACT_INPUT ? CurrencyAmount<TInput> : CurrencyAmount<TOutput>,
        tradeType: TTradeType
    ): Promise<Trade<TInput, TOutput, TTradeType>> {
        const amounts: CurrencyAmount<TokenCurrency>[] = new Array(route.tokenPath.length)
        let inputAmount: CurrencyAmount<TInput>
        let outputAmount: CurrencyAmount<TOutput>
        if (tradeType === TradeType.EXACT_INPUT) {
            invariant(amount.currency.equals(route.input), 'INPUT')
            amounts[0] = amount.wrapped
            for (let i = 0; i < route.tokenPath.length - 1; i++) {
                const pool = route.pools[i]
                const [outputAmount] = await this.getOutputAmount(pool, amounts[i])
                amounts[i + 1] = outputAmount
            }
            inputAmount = CurrencyAmount.fromFractionalAmount(route.input, amount.numerator, amount.denominator)
            outputAmount = CurrencyAmount.fromFractionalAmount(
                route.output,
                amounts[amounts.length - 1].numerator,
                amounts[amounts.length - 1].denominator
            )
        } else {
            invariant(amount.currency.equals(route.output), 'OUTPUT')
            amounts[amounts.length - 1] = amount.wrapped
            for (let i = route.tokenPath.length - 1; i > 0; i--) {
                const pool = route.pools[i - 1]
                const [inputAmount] = await this.getInputAmount(pool, amounts[i])
                amounts[i - 1] = inputAmount
            }
            inputAmount = CurrencyAmount.fromFractionalAmount(route.input, amounts[0].numerator, amounts[0].denominator)
            outputAmount = CurrencyAmount.fromFractionalAmount(route.output, amount.numerator, amount.denominator)
        }

        return new Trade({
            routes: [{ inputAmount, outputAmount, route }],
            tradeType,
        })
    }

    /**
     * Construct a trade by passing in the pre-computed property values
     * @param routes The routes through which the trade occurs
     * @param tradeType The type of trade, exact input or exact output
     */
    private constructor({
                            routes,
                            tradeType,
                        }: {
        routes: {
            route: RouteV3<TInput, TOutput>
            inputAmount: CurrencyAmount<TInput>
            outputAmount: CurrencyAmount<TOutput>
        }[]
        tradeType: TTradeType
    }) {
        const inputCurrency = routes[0].inputAmount.currency
        const outputCurrency = routes[0].outputAmount.currency
        invariant(
            routes.every(({ route }) => inputCurrency.wrapped.equals(route.input.wrapped)),
            'INPUT_CURRENCY_MATCH'
        )
        invariant(
            routes.every(({ route }) => outputCurrency.wrapped.equals(route.output.wrapped)),
            'OUTPUT_CURRENCY_MATCH'
        )

        const numPools = routes.map(({ route }) => route.pools.length).reduce((total, cur) => total + cur, 0)
        const poolAddressSet = new Set<string>()
        for (const { route } of routes) {
            for (const pool of route.pools) {
                poolAddressSet.add(PoolOld.getAddress(pool.token0.wrapped, pool.token1.wrapped, pool.fee))
            }
        }

        invariant(numPools == poolAddressSet.size, 'POOLS_DUPLICATED')

        this.swaps = routes
        this.tradeType = tradeType
    }

    /**
     * Get the minimum amount that must be received from this trade for the given slippage tolerance
     * @param slippageTolerance The tolerance of unfavorable slippage from the execution price of this trade
     * @returns The amount out
     */
    public minimumAmountOut(slippageTolerance: Percent, amountOut = this.outputAmount): CurrencyAmount<TOutput> {
        invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
        if (this.tradeType === TradeType.EXACT_OUTPUT) {
            return amountOut
        }
        const slippageAdjustedAmountOut = new Fraction(ONE)
            .add(slippageTolerance)
            .invert()
            .multiply(amountOut.quotient).quotient
        return CurrencyAmount.fromRawAmount(amountOut.currency, slippageAdjustedAmountOut)
    }

    /**
     * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
     * @param slippageTolerance The tolerance of unfavorable slippage from the execution price of this trade
     * @returns The amount in
     */
    public maximumAmountIn(slippageTolerance: Percent, amountIn = this.inputAmount): CurrencyAmount<TInput> {
        invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
        if (this.tradeType === TradeType.EXACT_INPUT) {
            return amountIn
        }
        const slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(amountIn.quotient).quotient
        return CurrencyAmount.fromRawAmount(amountIn.currency, slippageAdjustedAmountIn)
    }

    /**
     * Return the execution price after accounting for slippage tolerance
     * @param slippageTolerance the allowed tolerated slippage
     * @returns The execution price
     */
    public worstExecutionPrice(slippageTolerance: Percent): Price<TInput, TOutput> {
        return new Price(
            this.inputAmount.currency,
            this.outputAmount.currency,
            this.maximumAmountIn(slippageTolerance).quotient,
            this.minimumAmountOut(slippageTolerance).quotient
        )
    }

    /**
     * Given a list of pools, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
     * amount to an output token, making at most `maxHops` hops.
     * Note this does not consider aggregation, as routes are linear. It's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param pools the pools to consider in finding the best trade
     * @param nextAmountIn exact amount of input currency to spend
     * @param currencyOut the desired currency out
     * @param maxNumResults maximum number of results to return
     * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pool
     * @param currentPools used in recursion; the current list of pools
     * @param currencyAmountIn used in recursion; the original value of the currencyAmountIn parameter
     * @param bestTrades used in recursion; the current list of best trades
     * @returns The exact in trade
     */
    public static async bestTradeExactIn<TInput extends TokenCurrency, TOutput extends TokenCurrency>(
        pools: V3Pool[],
        currencyAmountIn: CurrencyAmount<TInput>,
        currencyOut: TOutput,
        { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
        // used in recursion.
        currentPools: V3Pool[] = [],
        nextAmountIn: CurrencyAmount<TokenCurrency> = currencyAmountIn,
        bestTrades: Trade<TInput, TOutput, TradeType.EXACT_INPUT>[] = []
    ): Promise<Trade<TInput, TOutput, TradeType.EXACT_INPUT>[]> {
        invariant(pools.length > 0, 'POOLS')
        invariant(maxHops > 0, 'MAX_HOPS')
        invariant(currencyAmountIn === nextAmountIn || currentPools.length > 0, 'INVALID_RECURSION')

        const amountIn = nextAmountIn.wrapped
        const tokenOut = currencyOut.wrapped
        for (let i = 0; i < pools.length; i++) {
            const pool = pools[i]
            // pool irrelevant
            if (!pool.token0.equals(amountIn.currency) && !pool.token1.equals(amountIn.currency)) continue

            let amountOut: CurrencyAmount<TokenCurrency>

            try {
                const [ result ] = await this.getOutputAmount(pool, amountIn)

                amountOut = result
            } catch (error) {
                // input too low
                if ((error as InsufficientInputAmountError).isInsufficientInputAmountError) {
                    continue
                }
                throw error
            }
            // we have arrived at the output token, so this is the final trade of one of the paths
            if (amountOut.currency.isToken && amountOut.currency.equals(tokenOut)) {
                sortedInsert(
                    bestTrades,
                    await Trade.fromRoute(
                        new RouteV3([...currentPools, pool], currencyAmountIn.currency, currencyOut),
                        currencyAmountIn,
                        TradeType.EXACT_INPUT
                    ),
                    maxNumResults,
                    tradeComparator
                )
            } else if (maxHops > 1 && pools.length > 1) {
                console.info(" (trade.ts:456) maxHops", maxHops);
                console.info(" (trade.ts:456) pools", pools);
                const poolsExcludingThisPool = pools.slice(0, i).concat(pools.slice(i + 1, pools.length))

                // otherwise, consider all the other paths that lead from this token as long as we have not exceeded maxHops
                await Trade.bestTradeExactIn(
                    poolsExcludingThisPool,
                    currencyAmountIn,
                    currencyOut,
                    {
                        maxNumResults,
                        maxHops: maxHops - 1,
                    },
                    [...currentPools, pool],
                    amountOut,
                    bestTrades
                )
            }
        }

        return bestTrades
    }

    public static async getOutputAmount(
        pool : V3Pool,
        inputAmount: CurrencyAmount<TokenCurrency>,
        sqrtPriceLimitX96?: bigint
    ): Promise<[CurrencyAmount<TokenCurrency>, V3Pool]> {
        // invariant(this.involvesToken(inputAmount.currency), 'TOKEN')

        const token0 = pool.token0
        const token1 = pool.token1
        const fee = pool.fee
        const zeroForOne = inputAmount.currency.equals(token0)

        const {
            amountCalculated: outputAmount,
            sqrtRatioX96,
            liquidity,
            tickCurrent,
        } = await this.swap(zeroForOne, inputAmount.quotient, pool.sqrtRatioX96, pool.liquidity, pool.tick, pool.fee, sqrtPriceLimitX96)
        const outputToken = zeroForOne ? token1 : token0
        return [
            CurrencyAmount.fromRawAmount(outputToken, outputAmount * NEGATIVE_ONE),
            {
                type: PoolType.V3,
                token0: token0,
                token1: token1,
                fee: fee,
                sqrtRatioX96: sqrtRatioX96,
                liquidity: liquidity,
                tick: tickCurrent,
                address: pool.address,
            } as V3Pool,
        ]
    }

    public static async swap(
        zeroForOne: boolean,
        amountSpecified: bigint,
        sqrtRatioX96: bigint,
        liquidity: bigint,
        tickCurrent: number,
        fee: FeeAmount,
        sqrtPriceLimitX96?: bigint
    ): Promise<{
        amountCalculated: bigint
        sqrtRatioX96: bigint
        liquidity: bigint
        tickCurrent: number
        amountSpecifiedRemaining: bigint
    }> {
        if (!sqrtPriceLimitX96)
            sqrtPriceLimitX96 = zeroForOne ? TickMath.MIN_SQRT_RATIO + ONE : TickMath.MAX_SQRT_RATIO - ONE

        if (zeroForOne) {
            invariant(sqrtPriceLimitX96 > TickMath.MIN_SQRT_RATIO, 'RATIO_MIN')
            invariant(sqrtPriceLimitX96 < sqrtRatioX96, 'RATIO_CURRENT')
        } else {
            invariant(sqrtPriceLimitX96 < TickMath.MAX_SQRT_RATIO, 'RATIO_MAX')
            invariant(sqrtPriceLimitX96 > sqrtRatioX96, 'RATIO_CURRENT')
        }

        const exactInput = amountSpecified >= ZERO

        // keep track of swap state

        const state = {
            amountSpecifiedRemaining: amountSpecified,
            amountCalculated: ZERO,
            sqrtPriceX96: sqrtRatioX96,
            tick: tickCurrent,
            liquidity: liquidity,
        }

        const ticks = [
            {
                index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[fee]),
                liquidityNet: liquidity,
                liquidityGross: liquidity
            },
            {
                index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[fee]),
                liquidityNet: -liquidity,
                liquidityGross: liquidity
            }
        ]
        const tickDataProvider = Array.isArray(ticks) ? new TickListDataProvider(ticks) : ticks
        // start swap while loop
        while (state.amountSpecifiedRemaining !== ZERO && state.sqrtPriceX96 != sqrtPriceLimitX96) {
            const step: Partial<StepComputations> = {}
            step.sqrtPriceStartX96 = state.sqrtPriceX96

            // because each iteration of the while loop rounds, we can't optimize this code (relative to the smart contract)
            // by simply traversing to the next available tick, we instead need to exactly replicate
            // tickBitmap.nextInitializedTickWithinOneWord

            ;[step.tickNext, step.initialized] = await tickDataProvider.nextInitializedTickWithinOneWord(
                state.tick,
                zeroForOne,
                this.tickSpacing(fee)
            )

            if (step.tickNext < TickMath.MIN_TICK) {
                step.tickNext = TickMath.MIN_TICK
            } else if (step!.tickNext! > TickMath.MAX_TICK) {
                step.tickNext = TickMath.MAX_TICK
            }

            step.sqrtPriceNextX96 = TickMath.getSqrtRatioAtTick(step.tickNext)
            ;[state.sqrtPriceX96, step.amountIn, step.amountOut, step.feeAmount] = SwapMath.computeSwapStep(
                state.sqrtPriceX96,
                (zeroForOne ? step.sqrtPriceNextX96 < sqrtPriceLimitX96 : step.sqrtPriceNextX96 > sqrtPriceLimitX96)
                    ? sqrtPriceLimitX96
                    : step.sqrtPriceNextX96,
                state.liquidity,
                state.amountSpecifiedRemaining,
                fee
            )

            if (exactInput) {
                state.amountSpecifiedRemaining = state.amountSpecifiedRemaining - (step.amountIn! + step.feeAmount!)
                state.amountCalculated = state.amountCalculated! - step.amountOut!
            } else {
                state.amountSpecifiedRemaining = state.amountSpecifiedRemaining! + step.amountOut!
                state.amountCalculated = state.amountCalculated! + (step.amountIn! + step.feeAmount!)
            }

            // TODO
            if (state.sqrtPriceX96 === step.sqrtPriceNextX96) {
                // if the tick is initialized, run the tick transition
                if (step.initialized) {
                    let liquidityNet = BigInt((await tickDataProvider.getTick(step.tickNext)).liquidityNet)
                    // if we're moving leftward, we interpret liquidityNet as the opposite sign
                    // safe because liquidityNet cannot be type(int128).min
                    if (zeroForOne) liquidityNet = liquidityNet * NEGATIVE_ONE

                    state.liquidity = LiquidityMath.addDelta(state.liquidity, liquidityNet)
                }

                state.tick = zeroForOne ? step.tickNext - 1 : step.tickNext
            } else if (state.sqrtPriceX96 !== step.sqrtPriceStartX96) {
                // updated comparison function
                // recompute unless we're on a lower tick boundary (i.e. already transitioned ticks), and haven't moved
                state.tick = TickMath.getTickAtSqrtRatio(state.sqrtPriceX96)
            }
        }

        return {
            amountSpecifiedRemaining: state.amountSpecifiedRemaining,
            amountCalculated: state.amountCalculated,
            sqrtRatioX96: state.sqrtPriceX96,
            liquidity: state.liquidity,
            tickCurrent: state.tick,
        }
    }

    public static tickSpacing(fee: FeeAmount): number {
        return TICK_SPACINGS[fee]
    }

    public static async getInputAmount(
        pool: V3Pool,
        outputAmount: CurrencyAmount<TokenCurrency>,
        sqrtPriceLimitX96?: bigint
    ): Promise<[CurrencyAmount<TokenCurrency>, V3Pool]> {
        // invariant(outputAmount.currency.isToken && this.involvesToken(outputAmount.currency), 'TOKEN')

        const zeroForOne = outputAmount.currency.equals(pool.token1)

        const {
            amountCalculated: inputAmount,
            sqrtRatioX96,
            liquidity,
            tickCurrent,
        } = await this.swap(zeroForOne, outputAmount.quotient * NEGATIVE_ONE, pool.sqrtRatioX96, pool.liquidity, pool.tick, pool.fee, sqrtPriceLimitX96)

        const inputToken = zeroForOne ? pool.token0 : pool.token1
        return [
            CurrencyAmount.fromRawAmount(inputToken, inputAmount),
            {
                type: PoolType.V3,
                token0: pool.token0,
                token1: pool.token1,
                fee: pool.fee,
                sqrtRatioX96: sqrtRatioX96,
                liquidity: liquidity,
                tick: tickCurrent,
                address: pool.address,
            } as V3Pool,
        ]
    }

}
