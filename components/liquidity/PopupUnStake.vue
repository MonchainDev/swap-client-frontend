<template>
  <BasePopup name="popup-unstake" width="540" title="Unstaking">
    <div class="px-8 pb-7">
      <div class="flex items-center justify-between">
        <div class="flex gap-1">
          <span class="font-semibold">{{ position.baseSymbol }}-{{ position.quoteSymbol }}</span>
          <span class="font-semibold text-gray-6">(#{{ position.tokenId }})</span>
        </div>
        <div class="flex gap-2">
          <span class="flex h-9 w-[117px] items-center justify-center gap-1 rounded-lg bg-[#E8FFEB] text-sm text-success">
            <BaseIcon name="loading" size="16" class="text-success" />
            <span>Farming</span>
          </span>
          <span class="flex h-9 w-[117px] items-center justify-center gap-1 rounded-lg bg-[#E8FFEB] text-sm text-success">
            <BaseIcon name="tick" size="24" class="text-success" />
            <span>Active</span>
          </span>
        </div>
      </div>
      <div class="mt-[30px] flex flex-col gap-[10px] rounded-lg border border-solid border-gray-4 bg-gray-1 px-6 pb-6 pt-5">
        <span>Min {{ min }} / Max {{ max }} of {{ position.baseSymbol }} per {{ position.quoteSymbol }}</span>
        <div>
          <span class="font-semibold text-gray-7">~${{ formatNumber(position.priceUdtTotal || 0) }}</span>
          <span>
            ({{ displayTokenReserve(position.quoteQuantity, position.quoteDecimals, position.quoteSymbol) }} /
            {{ displayTokenReserve(position.baseQuantity, position.baseDecimals, position.baseSymbol) }})</span
          >
        </div>
        <div class="flex items-center gap-1">
          <span class="font-semibold">APR</span>
          <BaseIcon name="calculator" size="16" />
          <span class="font-semibold text-success">{{ (position.feeApr || 0).toFixed(2) }}%</span>
        </div>
        <span class="font-semibold">ORB earned: 0 ($0)</span>
        <NuxtLink class="w-full" :to="{ name: 'liquidity-network-tokenId', params: { network: position.network, tokenId: position.tokenId } }">
          <button class="!mt-3 flex h-10 w-full items-center justify-center rounded border border-solid border-gray-3 bg-white font-medium">
            Manage Position
          </button>
        </NuxtLink>
      </div>
      <BaseButton :loading="loadingUnStake" class="mt-6 w-full text-xl font-semibold" size="md" @click="handleUnStake">UNSTAKE</BaseButton>
      <p class="mt-[22px] text-sm text-gray-7">
        Unstake will also automatically harvest any earnings that you haven’t collected yet, and send them to your wallet.
      </p>
    </div>
  </BasePopup>
</template>

<script lang="ts" setup>
  import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import { useAccount } from '@wagmi/vue'
  import { hexToBigInt } from 'viem'
  import { config } from '~/config/wagmi'
  import { CONTRACT_ADDRESS } from '~/constant/contract'
  import type { IBodyTxCollect } from '~/types/encrypt.type'
  import type { IPosition } from '~/types/position.type'
  import { MasterChefV3 } from '~/utils/masterChefV3'

  interface IProps {
    position?: IPosition
  }

  const props = withDefaults(defineProps<IProps>(), {
    position: undefined
  })

  const emit = defineEmits<{
    reload: []
  }>()

  const min = computed(() => {
    // priceLower*quotedecimals/basedecimals
    if (!props.position) return 0
    const { priceLower, baseDecimals, quoteDecimals } = props.position
    return props.position?.priceLower ? formatNumber(((priceLower * quoteDecimals) / baseDecimals).toFixed(2)) : 0
  })

  const max = computed(() => {
    if (!props.position) return 0
    const { priceUpper, baseDecimals, quoteDecimals } = props.position
    return priceUpper ? formatNumber(((priceUpper * quoteDecimals) / baseDecimals).toFixed(2)) : 0
  })

  const displayTokenReserve = (amount: number, decimals: number, symbol: string) => {
    // = (quoteQtty/10^quotedecimals) TokenA/(baseQtty/10^baseDecimals) TokenB
    return `${formatNumber((amount / Math.pow(10, decimals)).toFixed(2))} ${symbol}`
  }

  const loadingUnStake = ref(false)
  const { address: account } = useAccount()
  const { showToastMsg } = useShowToastMsg()
  const { setOpenPopup } = useBaseStore()

  const handleUnStake = async () => {
    try {
      if (props.position) {
        loadingUnStake.value = true

        const { calldata, value } = MasterChefV3.withdrawCallParameters({ to: account.value!, tokenId: BigInt(props.position?.tokenId) })

        const hash = await sendTransaction(config, {
          to: CONTRACT_ADDRESS.MASTER_CHEF_V3 as `0x${string}`,
          data: calldata,
          value: hexToBigInt(value)
        })

        console.log('🚀 ~ handleUnStake ~ hash:', hash)

        const { status } = await waitForTransactionReceipt(config, {
          hash,
          pollingInterval: 2000
        })
        if (status === 'success') {
          showToastMsg('Unstaked! Your funds ORB earnings have been sent to your wallet', 'success', hash)
          const { tokenId, network, tokenBase, tokenQuote, poolAddress, pendingReward } = props.position

          const body: IBodyTxCollect = {
            transactionHash: hash,
            tokenId: tokenId,
            network: network,
            fromAddress: account.value!,
            toAddress: CONTRACT_ADDRESS.MASTER_CHEF_V3,
            fromToken: tokenBase,
            toToken: tokenQuote,
            poolAddress: poolAddress,
            rewardAmount: pendingReward,
            transactionType: 'UNSTAKE'
          }
          await postTransaction(body)
          emit('reload')
          setOpenPopup('popup-unstake', false)
        } else {
          showToastMsg('Transaction failed', 'error', hash)
        }
      }
    } catch (error) {
      console.error('handleUnStake error', error)
      //@ts-ignore
      const msg = error?.shortMessage || null
      if (msg) {
        showToastMsg(msg, 'error')
      }
    } finally {
      loadingUnStake.value = false
    }
  }
</script>

<style lang="scss" scoped></style>
