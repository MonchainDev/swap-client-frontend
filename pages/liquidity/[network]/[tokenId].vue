<template>
  <div v-loading="isLoading" class="relative mx-auto mt-10 max-w-[1024px] pb-6 sm:mt-0 sm:px-4">
    <HeaderPositionDetail
      :currency-quote="currencyQuote"
      :currency-base="currencyBase"
      :is-connected="isConnected"
      :format-fee="formatFee"
      :is-owner="isOwner"
      :fee-apr="positionDetail?.feeApr"
      :reward-apr="positionDetail?.rewardApr"
      @add-liquid="handleClickAddLiquidity"
    />
    <div class="mt-12 rounded-lg bg-white shadow-md">
      <div class="grid grid-cols-2 gap-8 border-b border-solid border-gray-3 p-8 sm:grid-cols-1 sm:px-4">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-4">
              <span class="text-2xl font-semibold leading-7 sm:text-base">Liquidity</span>
              <span class="flex items-center gap-1 text-sm">
                <span>APR</span>
                <BaseIcon name="calculator" size="16" class="text-gray-4" />
                <span class="text-[#049C6B]">{{ positionDetail?.feeApr }}% </span>
              </span>
            </div>
            <span class="text-[48px] font-semibold">${{ formatNumber((Number(priceUsdBase) + Number(priceUsdQuote)).toFixed(2)) }}</span>
          </div>
          <div class="flex h-[164px] flex-col rounded-lg bg-gray-1">
            <div class="flex h-1/2 items-center justify-between border-b border-solid border-gray-3 px-8">
              <div class="flex items-center gap-[10px]">
                <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
                <span class="text-[22px] font-semibold leading-7">{{ positionValueUpper?.currency.symbol }}</span>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <span class="text-[22px] font-semibold leading-7">{{ formattedValueUpper }}</span>
                <span class="text-sm text-gray-6">${{ formatNumber(priceUsdBase) }}</span>
              </div>
            </div>
            <div class="flex h-1/2 items-center justify-between px-8">
              <div class="flex items-center gap-[10px]">
                <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
                <span class="text-[22px] font-semibold leading-7">{{ unwrappedToken(positionValueLower?.currency)?.symbol }}</span>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <span class="text-[22px] font-semibold leading-7">{{ formattedValueLower }}</span>
                <span class="text-sm text-gray-6">${{ formatNumber(priceUsdQuote) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex justify-between sm:items-center">
            <div class="flex flex-col">
              <span class="text-2xl font-semibold leading-7 sm:text-base">Unclaimed fees</span>
              <span class="line-clamp-1 text-[48px] font-semibold text-hyperlink"
                >${{ formatNumber((Number(priceUsdFeeLower) + Number(priceUsdFeeUpper)).toFixed(2)) }}</span
              >
            </div>
            <BaseButton
              :disabled="disabledCollect"
              :loading="loadingCollect"
              type="linear"
              size="md"
              class="w-[170px] text-xl font-semibold uppercase"
              @click="handleCollect"
              >Collect</BaseButton
            >
          </div>

          <div class="flex h-[164px] flex-col rounded-lg bg-gray-1">
            <div class="flex h-1/2 items-center justify-between border-b border-solid border-gray-3 px-8">
              <div class="flex items-center gap-[10px]">
                <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
                <span class="text-[22px] font-semibold leading-7">{{ feeValueUpper?.currency.symbol }}</span>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <span class="text-[22px] font-semibold leading-7">{{ formattedFeeUpper }}</span>
                <span class="text-sm text-gray-6">${{ formatNumber(priceUsdFeeUpper) }}</span>
              </div>
            </div>
            <div class="flex h-1/2 items-center justify-between px-8">
              <div class="flex items-center gap-[10px]">
                <img src="/token-default.png" alt="logo" class="size-9 rounded-full" />
                <span class="text-[22px] font-semibold leading-7">{{ feeValueLower?.currency.symbol }}</span>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <span class="text-[22px] font-semibold leading-7">{{ formattedFeeLower }}</span>
                <span class="text-sm text-gray-6">${{ formatNumber(priceUsdFeeLower) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4 px-8 pb-10 pt-6">
        <span class="text-2xl font-semibold leading-7 sm:text-base">Price range {{ currencyQuote?.symbol }}/{{ currencyBase?.symbol }}</span>
        <div class="flex items-center gap-10 sm:grid sm:grid-cols-2 sm:gap-x-5 sm:gap-y-2">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-8">Min</span>
            <span class="text-base font-semibold">{{ minAmount }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-8">Max</span>
            <span class="text-base font-semibold">{{ maxAmount }} </span>
          </div>
          <ChartLine v-if="dataChart?.length" :data="dataChart" />
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-8">Current price</span>
            <span class="text-base font-semibold">{{ currentPrice }}</span>
          </div>
        </div>
      </div>
    </div>

    <TableActivityPosition :data-txs="dataTxs ?? []" :loading-txs="loadingTxs" />

    <div class="bg-linear-mb absolute left-0 top-0 hidden h-[100px] w-screen sm:block"></div>
  </div>
  <PopupAddLiquidity
    :currency-base
    :position="position"
    :currency-quote
    :position-value-lower
    :position-value-upper
    :value-lower="formattedValueLower"
    :value-upper="formattedValueUpper"
    :fee-format="formatFee"
    :usd-lower="priceUsdQuote"
    :usd-upper="priceUsdBase"
    @reload="refetch"
  />
</template>

<script lang="ts" setup>
  import { type Currency, type Price, type Token } from '@monchain/swap-sdk-core'
  import type { FeeAmount, Pool } from '@monchain/v3-sdk'
  import { nearestUsableTick, Position, TICK_SPACINGS, TickMath } from '@monchain/v3-sdk'
  import { useQuery } from '@tanstack/vue-query'
  import { useAccount } from '@wagmi/vue'
  import Decimal from 'decimal.js'
  import { gql } from 'graphql-request'
  import ChartLine from '~/components/chart/ChartLine.vue'
  import PopupAddLiquidity from '~/components/liquidity/PopupAddLiquidity.vue'
  import { LIST_NETWORK } from '~/config/networks'
  import { Bound, ChainId } from '~/types'
  import type { IPosition } from '~/types/position.type'

  const enum TabValue {
    COLLECT = 'COLLECT',
    SWAP = 'SWAP',
    ADD = 'ADD',
    REMOVE = 'REMOVE'
  }
  interface IToken {
    symbol: string
  }

  export interface ITx {
    id: string
    timestamp: number | string
    amount0: string
    amount1: string
    token0?: IToken
    token1?: IToken
    type: TabValue.ADD | TabValue.REMOVE | TabValue.SWAP | TabValue.COLLECT
    pool?: {
      token0: IToken
      token1: IToken
    }
  }

  interface IMintTransaction {
    mints: ITx[]
  }

  interface ISwapTransaction {
    swaps: ITx[]
  }

  interface IBurnTransaction {
    burns: ITx[]
  }

  interface ICollectTransaction {
    collects: ITx[]
  }

  interface ITransaction {
    burns: { transaction: IBurnTransaction }[]
    collects: { transaction: ICollectTransaction }[]
    mints: { transaction: IMintTransaction }[]
    swaps: { transaction: ISwapTransaction }[]
  }

  interface IPositionTx {
    transaction: ITransaction
  }

  interface IPositionsData {
    positions: IPositionTx[]
  }

  definePageMeta({
    middleware: ['validate-network-middleware']
  })

  const route = useRoute('liquidity-network-tokenId')

  const { setOpenPopup } = useBaseStore()

  const tokenId = computed(() => {
    return route.params.tokenId ? BigInt(route.params.tokenId) : undefined
  })

  const { isConnected, address: account } = useAccount()
  // const { chainId } = useActiveChainId()
  const { feeAmount, form, existingPosition, exchangeRateBaseCurrency, exchangeRateQuoteCurrency, baseCurrency, quoteCurrency } =
    storeToRefs(useLiquidityStore())

  const networkOfPool = computed(() => {
    const networkUrl = route.params.network
    return LIST_NETWORK.find((item) => item.network.toUpperCase() === networkUrl.toUpperCase())
  })

  const { isLoading, position: _position, refetch } = useV3PositionsFromTokenId(tokenId.value)

  const masterChefV3 = computed(() => getMasterChefV3Address(networkOfPool.value?.chainId))

  const { tokenIds } = useV3TokenIdsByAccount(masterChefV3.value)
  const isStakeMV3 = computed(() => tokenIds.value?.includes(tokenId.value!))

  const { data: positionDetail } = useFetch<IPosition>(`/api/position/get/${tokenId.value?.toString()}`, { query: { network: route.params.network } })

  const liquidity = computed(() => _position.value?.liquidity)
  const tickLower = computed(() => _position.value?.tickLower)
  const tickUpper = computed(() => _position.value?.tickUpper)
  const token0Address = computed(() => _position.value?.token0)
  const token1Address = computed(() => _position.value?.token1)
  const fee = computed(() => _position.value?.fee)

  const formatFee = computed(() => {
    return fee.value ? `${fee.value / 10000}%` : ''
  })

  // const removed = computed(() => liquidity.value === 0n)

  const token0 = ref<Token>()
  const token1 = ref<Token>()

  // const unwrapToken0 = computed(() => unwrappedToken(token0.value))
  // const unwrapToken1 = computed(() => unwrappedToken(token1.value))

  watchEffect(async () => {
    if (_position.value) {
      token0.value = await getTokenByChainId(token0Address.value as string, networkOfPool.value?.chainId || ChainId.MON_TESTNET)
      console.log('🚀 ~ watchEffect ~ token0:', token0.value)
      token1.value = await getTokenByChainId(token1Address.value as string, networkOfPool.value?.chainId || ChainId.MON_TESTNET)
      console.log('🚀 ~ watchEffect ~ token1:', token1.value)

      feeAmount.value = fee.value ?? 0
    }
  })

  const inverted = computed(() => (token1.value && base.value ? base.value.equals(token1.value) : undefined))

  // if pool has aNATIVE, set token0 or 1 to NATIVE
  watchEffect(() => {
    if (token0.value && token1.value) {
      form.value.token0 = {
        ...form.value.token0,
        ...token0.value,
        icon_url: '',
        name: token0.value?.name || '',
        decimals: token0.value?.decimals ?? 18,
        symbol: token0.value?.symbol ?? '',
        address: token0.value.isNative ? zeroAddress : (token0.value?.address as string),
        tokenSymbol: token0.value?.symbol ?? '',
        tokenAddress: token0.value.isNative ? zeroAddress : (token0.value?.address as string),
        tokenDecimals: token0.value?.decimals ?? 18,
        chainId: token0.value.chainId
      }
      form.value.token1 = {
        ...form.value.token1,
        ...token1.value,
        icon_url: '',
        name: token1.value?.name || '',
        decimals: token1.value?.decimals ?? 18,
        symbol: token1.value?.symbol ?? '',
        address: token1.value.isNative ? '' : (token1.value?.address as string),
        tokenSymbol: token1.value?.symbol ?? '',
        tokenAddress: token1.value.isNative ? '' : (token1.value?.address as string),
        tokenDecimals: token1.value?.decimals ?? 18,
        chainId: token1.value.chainId
      }
    }
  })

  const currency0 = computed(() => (token0.value ? token0.value : undefined))
  const currency1 = computed(() => (token1.value ? token1.value : undefined))

  const { pool } = usePools()

  const receiveWNATIVE = ref(false)
  const { feeValue0, feeValue1, owner } = useV3PositionFees(pool as Ref<Pool>, receiveWNATIVE.value)

  const feeValueUpper = computed(() => (inverted.value ? feeValue0.value : feeValue1.value))
  const feeValueLower = computed(() => (inverted.value ? feeValue1.value : feeValue0.value))

  const isOwner = computed(() => account.value === owner.value || _position.value?.operator === account.value || isStakeMV3.value)

  // these currencies will match the feeValue{0,1} currencies for the purposes of fee collection
  // const currency0ForFeeCollectionPurposes = computed(() =>
  //   pool.value ? (receiveWNATIVE.value ? pool.value.token0 : unwrappedToken(pool.value.token0)) : undefined
  // )
  // const currency1ForFeeCollectionPurposes = computed(() =>
  //   pool.value ? (receiveWNATIVE.value ? pool.value.token1 : unwrappedToken(pool.value.token1)) : undefined
  // )

  const position = computed(() => {
    if (pool.value && typeof liquidity.value === 'bigint' && typeof tickLower.value === 'number' && typeof tickUpper.value === 'number') {
      return new Position({ pool: pool.value as Pool, liquidity: liquidity.value.toString(), tickLower: tickLower.value, tickUpper: tickUpper.value })
    }
    return undefined
  })

  const tickAtLimit = computed(() => {
    if (position.value) {
      return {
        [Bound.LOWER]:
          fee.value && tickLower.value ? tickLower.value === nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[fee.value as FeeAmount]) : undefined,
        [Bound.UPPER]:
          fee.value && tickUpper.value ? tickUpper.value === nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[fee.value as FeeAmount]) : undefined
      }
    }
    return undefined
  })

  const priceFromPosition = computed(() => {
    return getPriceOrderingFromPositionForUI(position.value)
  })

  const manuallyInverted = ref(false)

  const priceLower = computed(() => {
    return manuallyInverted.value ? priceFromPosition.value?.priceUpper?.invert() : priceFromPosition.value?.priceLower
  })
  const priceUpper = computed(() => {
    return manuallyInverted.value ? priceFromPosition.value?.priceLower?.invert() : priceFromPosition.value?.priceUpper
  })
  const base = computed(() => (manuallyInverted.value ? priceFromPosition.value?.quote : priceFromPosition.value?.base))
  // const quote = computed(() => (manuallyInverted.value ? priceFromPosition.value?.base : priceFromPosition.value?.quote))

  const minAmount = computed(() => {
    return formatTickPrice(priceLower.value, tickAtLimit.value ?? {}, Bound.LOWER, 'en-US')
  })

  const maxAmount = computed(() => {
    return formatTickPrice(priceUpper.value, tickAtLimit.value ?? {}, Bound.UPPER, 'en-US')
  })

  const currentPrice = computed(() => {
    if (pool.value) {
      return formatPrice(
        inverted.value ? (pool.value?.token1Price as Price<Currency, Currency> | undefined) : (pool.value.token0Price as Price<Currency, Currency> | undefined),
        6,
        'en-US'
      )
    }
    return ''
  })

  const currencyQuote = computed(() => (inverted.value ? currency0.value : currency1.value))
  const currencyBase = computed(() => (inverted.value ? currency1.value : currency0.value))

  const positionValueUpper = computed(() => (inverted.value ? position.value?.amount0 : position.value?.amount1))
  const positionValueLower = computed(() => (inverted.value ? position.value?.amount1 : position.value?.amount0))

  const formattedValueUpper = computed(() => {
    return formattedCurrencyAmount(positionValueUpper.value)
  })
  const formattedValueLower = computed(() => {
    return formattedCurrencyAmount(positionValueLower.value)
  })

  const formattedFeeUpper = computed(() => {
    return formatCurrencyAmount(feeValueUpper.value, 4, 'en-US')
  })

  const formattedFeeLower = computed(() => {
    return formatCurrencyAmount(feeValueLower.value, 4, 'en-US')
  })

  const priceUsdBase = computed(() => {
    if (!formattedValueUpper.value) return '0'
    const exchangeRate = feeValueUpper.value?.currency.wrapped.equals(baseCurrency.value?.wrapped as Currency)
      ? exchangeRateBaseCurrency.value
      : exchangeRateQuoteCurrency.value
    if (currencyBase.value && exchangeRate) {
      return new Decimal(formattedValueUpper.value.replaceAll(',', '')).mul(exchangeRate).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const priceUsdQuote = computed(() => {
    if (!formattedValueLower.value) return '0'
    const exchangeRate = feeValueLower.value?.currency.wrapped.equals(quoteCurrency.value?.wrapped as Currency)
      ? exchangeRateQuoteCurrency.value
      : exchangeRateBaseCurrency.value
    if (currencyQuote.value && exchangeRate) {
      return new Decimal(formattedValueLower.value.replaceAll(',', '')).mul(exchangeRate).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const priceUsdFeeUpper = computed(() => {
    if (!feeValueUpper.value) return '0'
    const exchangeRate = feeValueUpper.value.currency.wrapped.equals(baseCurrency.value?.wrapped as Currency)
      ? exchangeRateBaseCurrency.value
      : exchangeRateQuoteCurrency.value
    if (currencyBase.value && exchangeRate) {
      return new Decimal(feeValueUpper.value.toExact()).mul(exchangeRateBaseCurrency.value).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const priceUsdFeeLower = computed(() => {
    if (!feeValueLower.value) return '0'
    const exchangeRate = feeValueLower.value.currency.wrapped.equals(quoteCurrency.value?.wrapped as Currency)
      ? exchangeRateQuoteCurrency.value
      : exchangeRateBaseCurrency.value
    if (currencyQuote.value && exchangeRate) {
      return new Decimal(feeValueLower.value.toExact()).mul(exchangeRateQuoteCurrency.value).toSignificantDigits(6).toString()
    }
    return '0'
  })

  const handleClickAddLiquidity = () => {
    existingPosition.value = position.value as Position
    // form.value.token0 = { ...token0.value, icon_url: '', name: token0.value?.name || '' } as unknown as IToken
    // form.value.token1 = { ...token1.value, icon_url: '', name: token1.value?.name || '' } as unknown as IToken
    // feeAmount.value = fee.value ?? 0
    setOpenPopup('popup-add-liquidity')
  }

  const disabledCollect = computed(() => {
    return !isConnected.value || !isOwner.value || (feeValue0.value?.equalTo(0) && feeValue1.value?.equalTo(0))
  })

  const { collectFee, loading: loadingCollect } = useCollectFee()

  const handleCollect = async () => {
    if (feeValue0.value && feeValue1.value) {
      const options: Omit<CollectOptions, 'tokenId'> = {
        recipient: account.value as `0x${string}`,
        expectedCurrencyOwed0: feeValue0.value,
        expectedCurrencyOwed1: feeValue1.value
      }
      collectFee(tokenId.value, options, isStakeMV3.value)
    }
  }

  async function getListTxPosition(positionId: string) {
    try {
      const client = getGraphQLClient(networkOfPool.value!.chainId)
      // Định nghĩa query với variable
      const query = gql`
        query MyQuery($positionId: String!) {
          positions(where: { id: $positionId }) {
            transaction {
              burns {
                transaction {
                  burns {
                    id
                    timestamp
                    amount0
                    amount1
                    token0 {
                      symbol
                    }
                    token1 {
                      symbol
                    }
                  }
                }
              }
              collects {
                transaction {
                  collects {
                    id
                    amount0
                    amount1
                    timestamp
                    pool {
                      token0 {
                        symbol
                      }
                      token1 {
                        symbol
                      }
                    }
                  }
                }
              }
              mints {
                transaction {
                  mints {
                    id
                    amount0
                    amount1
                    timestamp
                    token0 {
                      symbol
                    }
                    token1 {
                      symbol
                    }
                  }
                }
              }
              swaps {
                transaction {
                  swaps {
                    id
                    amount0
                    amount1
                    timestamp
                    token0 {
                      symbol
                    }
                    token1 {
                      symbol
                    }
                  }
                }
              }
            }
          }
        }
      `
      const variables = {
        positionId
      }
      const data = await client.request<IPositionsData>(query, variables)

      return data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const { data: dataTxs, isLoading: loadingTxs } = useQuery({
    queryKey: computed(() => ['txs-position-detail', route.params.tokenId]),
    queryFn: async () => flattenTransactions(await getListTxPosition(route.params.tokenId)),
    enabled: computed(() => !!route.params.tokenId)
  })

  const flattenTransactions = (data: IPositionsData): ITx[] => {
    if (!data.positions.length) return []
    return data.positions.flatMap((position) => {
      const { burns, collects, mints, swaps } = position.transaction

      return [
        ...burns.flatMap((burn) => burn.transaction.burns.map((tx) => ({ ...tx, type: TabValue.REMOVE }))),
        ...collects.flatMap((collect) =>
          collect.transaction.collects.map((tx) => ({ ...tx, token0: tx.pool?.token0, token1: tx.pool?.token1, type: TabValue.COLLECT }))
        ),
        ...mints.flatMap((mint) => mint.transaction.mints.map((tx) => ({ ...tx, type: TabValue.ADD }))),
        ...swaps.flatMap((swap) => swap.transaction.swaps.map((tx) => ({ ...tx, type: TabValue.SWAP })))
      ]
    })
  }

  async function getDataChart(poolAddress: string | undefined) {
    try {
      const client = getGraphQLClient(networkOfPool.value!.chainId)
      // Định nghĩa query với variable
      const query = gql`
        query MyQuery($poolAddress: String!) {
          poolHourDatas(
            where: { pool: $poolAddress }
            first: 168 # 168 giờ = 7 ngày
            orderBy: periodStartUnix
            orderDirection: desc
          ) {
            periodStartUnix
            token0Price # Giá hiện tại và lịch sử giá
          }
        }
      `
      const variables = {
        poolAddress
      }
      const data = await client.request<{ poolHourDatas: { periodStartUnix: number; token0Price: string }[] }>(query, variables)
      return data.poolHourDatas.sort((a, b) => a.periodStartUnix - b.periodStartUnix)
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const { data: dataChart } = useQuery({
    queryKey: computed(() => ['chart-position-detail', positionDetail.value?.poolAddress]),
    queryFn: () => getDataChart(positionDetail.value?.poolAddress),
    enabled: computed(() => !!positionDetail.value?.poolAddress)
  })
</script>

<style lang="scss" scoped></style>
