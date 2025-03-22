<template>
  <a target="_blank" class="cursor-pointer text-sm font-semibold hover:text-hyperlink hover:underline">{{ getTran }}</a>
</template>

<script lang="ts" setup>
  import { useQuery } from '@tanstack/vue-query'
  import type { IExchangeRate } from '~/types'
  import type { ITransaction } from '~/types/transaction.type'

  interface IProps {
    row: ITransaction
  }
  const props = withDefaults(defineProps<IProps>(), {
    row: () => ({}) as ITransaction
  })

  const { listToken } = storeToRefs(useBaseStore())

  const getTran = computed(() => {
    const type = props.row.transactionType.split('_').join(' ')
    // const { baseSymbol, quoteSymbol } = props.pool
    const baseToken = listToken.value.find((token) => token.address?.toLocaleLowerCase() === props.row.fromToken?.toLocaleLowerCase())
    const quoteToken = listToken.value.find((token) => token.address?.toLocaleLowerCase() === props.row.toToken?.toLocaleLowerCase())
    if (props.row.transactionType === 'SWAP') {
      return `${type} ${baseToken?.symbol ?? ''} for ${quoteToken?.symbol ?? ''}`
    }
    if (props.row.transactionType === 'ADD_POOL') {
      return type
    }
    return type
  })

  const { data: _data } = useQuery({
    queryKey: computed(() => ['transaction', props.row.transactionHash]),
    queryFn: async () => {
      const baseToken = listToken.value.find((token) => token.address?.toLocaleLowerCase() === props.row.fromToken?.toLocaleLowerCase())
      const { data } = useFetch<IExchangeRate[]>(`/api/exchange-rate/all?currencies=${baseToken?.symbol}`)
      console.log('🚀 ~ queryFn: ~ data:', data)
      return data.value
    },
    enabled: computed(() => !!props.row.transactionHash)
  })
</script>

<style lang="scss" scoped></style>
