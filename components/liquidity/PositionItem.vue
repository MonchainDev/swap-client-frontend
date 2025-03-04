<template>
  <div
    class="grid cursor-pointer grid-cols-[3fr,1fr,1fr,3fr,3fr,2fr] border-b border-solid border-gray-2 py-6 hover:bg-gray-2"
    @click="router.push(`/liquidity/${props.position.tokenId}`)"
  >
    <div class="flex items-center gap-[10px]">
      <div class="flex">
        <img src="/token-default.png" alt="token" class="size-9 rounded-full border border-solid border-white" />
        <img src="/token-default.png" alt="token" class="-ml-4 size-9 rounded-full border border-solid border-white" />
      </div>
      <div class="flex flex-col">
        <div class="line-clamp-1 text-base font-semibold">{{ currency0?.symbol }}/{{ currency1?.symbol }}</div>
        <div class="flex items-center space-x-1">
          <img :src="networkSelected?.logo" :alt="networkSelected?.title" class="size-[14px]" />
          <span class="text-xs text-gray-8">{{ networkSelected?.title }} | #{{ props.position.tokenId }}</span>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center">
      <span class="rounded bg-gray-2 px-2 py-1 text-sm">{{ fee }}</span>
    </div>
    <div></div>
    <div class="flex flex-col justify-center text-sm">
      <span>Min: {{ minAmount }} {{ base?.symbol }}/{{ quote?.symbol }}</span>
      <span>Max: {{ maxAmount }} {{ base?.symbol }}/{{ quote?.symbol }}</span>
    </div>
    <div class="flex flex-col text-sm">
      <span>≈ $0</span>
      <span>({{ displayTokenReserve(_position?.amount0) }} /</span>
      <span>{{ displayTokenReserve(_position?.amount1) }})</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { CurrencyAmount, Token } from '@monchain/swap-sdk-core'
  import { LIST_NETWORK } from '~/constant'
  import { Bound, type PositionDetail } from '~/types'

  interface IProps {
    position: PositionDetail
  }

  const props = withDefaults(defineProps<IProps>(), {
    position: () => ({}) as PositionDetail
  })

  const router = useRouter()

  const { currency0, currency1, position: _position, tickAtLimit, base, priceLower, priceUpper, quote } = useExtraV3PositionInfo(props.position)

  const networkSelected = computed(() => {
    if (props.position) {
      return LIST_NETWORK.find((item) => item.chainId === props.position.chainId)
    }
    return undefined
  })

  const fee = computed(() => {
    if (props.position) {
      return `${props.position.fee / 10000}%`
    }
    return ''
  })

  const minAmount = computed(() => {
    return formatTickPrice(priceLower.value, tickAtLimit.value ?? {}, Bound.LOWER, 'en-US')
  })

  const maxAmount = computed(() => {
    return formatTickPrice(priceUpper.value, tickAtLimit.value ?? {}, Bound.UPPER, 'en-US')
  })

  const displayTokenReserve = (amount?: CurrencyAmount<Token>) => {
    const minimumFractionDigits = Math.min(amount?.currency.decimals ?? 0, 6)
    const quantity = amount && !amount.equalTo(0) ? amount.toFixed(minimumFractionDigits) : '0'
    const symbol = amount?.currency.symbol ?? '-'

    return `${formatNumber(quantity)} ${symbol}`
  }
</script>

<style lang="scss"></style>
