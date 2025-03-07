<template>
  <div
    class="grid cursor-pointer grid-cols-[3fr,2fr,2fr,3fr,3fr,2fr] border-b border-solid border-gray-2 py-6 hover:bg-gray-2"
    @click="router.push(`/liquidity/${props.position.tokenId}`)"
  >
    <div class="flex items-center gap-[10px] pl-6">
      <div class="flex">
        <img src="/token-default.png" alt="token" class="size-9 rounded-full border border-solid border-white" />
        <img src="/token-default.png" alt="token" class="-ml-4 size-9 rounded-full border border-solid border-white" />
      </div>
      <div class="flex flex-col">
        <div class="line-clamp-1 text-base font-semibold">{{ props.position?.baseSymbol }}/{{ props.position.quoteSymbol }}</div>
        <div class="flex items-center space-x-1">
          <img :src="networkSelected?.logo" :alt="networkSelected?.title" class="size-[14px]" />
          <span class="text-xs text-gray-8">{{ networkSelected?.title }} | #{{ props.position.tokenId }}</span>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center">
      <span class="rounded bg-gray-2 px-2 py-1 text-sm">{{ fee }}</span>
    </div>
    <div class="flex flex-col items-center justify-center gap-1 text-sm">
      <span class="font-semibold text-success"></span>
      <!-- <span class="text-gray-6">{{ props.position.rewardApr }}%</span> -->
    </div>
    <div class="flex flex-col justify-center text-sm">
      <span>Min: {{ min }} {{ props.position.baseSymbol }}/{{ props.position.quoteSymbol }}</span>
      <span>Max: {{ max }} {{ props.position.baseSymbol }}/{{ props.position.quoteSymbol }}</span>
    </div>
    <div class="flex flex-col text-sm">
      <span>≈ $0</span>
      <span>({{ displayTokenReserve(0, props.position.quoteDecimals, props.position.quoteSymbol) }} /</span>
      <span>{{ displayTokenReserve(0, props.position.baseDecimals, props.position.baseSymbol) }})</span>
    </div>
    <!-- <div class="flex items-center justify-center text-center text-sm" :class="classStatus"></div> -->
  </div>
</template>

<script lang="ts" setup>
  // import type { CurrencyAmount, Token } from '@monchain/swap-sdk-core'
  import { LIST_NETWORK } from '~/constant'
  // import { Bound } from '~/types'
  import type { IPosition } from '~/types/position.type'

  interface IProps {
    // position: PositionDetail
    position: IPosition
  }

  const props = withDefaults(defineProps<IProps>(), {
    // position: () => ({}) as PositionDetail
    position: () => ({}) as IPosition
  })

  const router = useRouter()

  // const { currency0, currency1, position: _position, tickAtLimit, base, priceLower, priceUpper, quote } = useExtraV3PositionInfo(props.position)

  const networkSelected = computed(() => {
    if (props.position) {
      return LIST_NETWORK.find((item) => item.value === props.position.network)
    }
    return undefined
  })

  const fee = computed(() => {
    if (props.position) {
      return `${props.position.fee / 10000}%`
    }
    return ''
  })

  // const minAmount = computed(() => {
  //   return formatTickPrice(props.position.priceLower, {}, Bound.LOWER, 'en-US')
  // })

  // const maxAmount = computed(() => {
  //   return formatTickPrice(priceUpper.value, tickAtLimit.value ?? {}, Bound.UPPER, 'en-US')
  // })

  // const displayTokenReserve = (amount?: CurrencyAmount<Token>) => {
  //   const minimumFractionDigits = Math.min(amount?.currency.decimals ?? 0, 6)
  //   const quantity = amount && !amount.equalTo(0) ? amount.toFixed(minimumFractionDigits) : '0'
  //   const symbol = amount?.currency.symbol ?? '-'

  //   return `${formatNumber(quantity)} ${symbol}`
  // }

  // const calculatePositionAmounts = computed(() => {
  //   const position = props.position
  //   const sqrt = Math.sqrt
  //   const pow = Math.pow

  //   // Trích xuất dữ liệu
  //   const { priceLower, priceUpper, currentTick, liquidity } = position

  //   // Tính căn bậc hai của giá
  //   const sqrtPriceLower = sqrt(priceLower)
  //   const sqrtPriceUpper = sqrt(priceUpper)
  //   const sqrtPriceCurrent = sqrt(pow(1.0001, currentTick))

  //   // Tính Base Amount
  //   let baseAmount = 0
  //   if (currentTick < position.tickUpper) {
  //     baseAmount = (liquidity * (sqrtPriceUpper - sqrtPriceCurrent)) / (sqrtPriceUpper * sqrtPriceCurrent)
  //   }

  //   // Tính Quote Amount
  //   let quoteAmount = 0
  //   if (currentTick > position.tickLower) {
  //     quoteAmount = liquidity * (sqrtPriceCurrent - sqrtPriceLower)
  //   }

  //   return {
  //     baseAmount,
  //     quoteAmount
  //   }
  // })

  const displayTokenReserve = (amount: number, decimals: number, symbol: string) => {
    // = (quoteQtty/10^quotedecimals) TokenA/(baseQtty/10^baseDecimals) TokenB
    return `${formatNumber((amount / Math.pow(10, decimals)).toFixed(2))} ${symbol}`
  }

  // const enum TabValue {
  //   ALL = 'ALL',
  //   ACTIVE = 'ACTIVE',
  //   INACTIVE = 'INACTIVE',
  //   CLOSE = 'CLOSE'
  // }

  function _capitalizeFirstLetter(string: string) {
    if (!string) return ''
    return string.charAt(0).toUpperCase() + string.slice(1).toLocaleLowerCase()
  }

  // const classStatus = computed(() => {
  //   const status = props.position.poolStatus
  //   return {
  //     'text-error': status === TabValue.CLOSE,
  //     'text-success': status === TabValue.ACTIVE,
  //     'text-warning': status === TabValue.INACTIVE
  //   }
  // })

  const min = computed(() => {
    // priceLower*quotedecimals/basedecimals
    const { priceLower, baseDecimals, quoteDecimals } = props.position
    return props.position.priceLower ? formatNumber(((priceLower * quoteDecimals) / baseDecimals).toFixed(2)) : 0
  })

  const max = computed(() => {
    const { priceUpper, baseDecimals, quoteDecimals } = props.position
    return priceUpper ? formatNumber(((priceUpper * quoteDecimals) / baseDecimals).toFixed(2)) : 0
  })
</script>

<style lang="scss"></style>
