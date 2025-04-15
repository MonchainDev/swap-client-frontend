<template>
  <div class="flex flex-col gap-2 rounded-lg bg-white px-8 pb-9 pt-[21px] shadow-md sm:gap-0 sm:p-4">
    <span class="text-2xl font-semibold leading-7 sm:text-lg"> Bridge </span>
    <span class="text-sm text-gray-8 sm:text-xs">Connects assets across blockchain networks seamlessly.</span>
    <div class="relative mt-6 flex w-full justify-between gap-1 sm:mt-5">
      <div class="from-network w-1/2">
        <ChooseNetworkBridge type="FROM" />
      </div>
      <div class="relative z-10 select-none">
        <div
          class="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-[4px] border-solid border-white bg-[#1573FE] p-2 sm:size-9"
          @click="handleSwapOrder"
        >
          <BaseIcon name="bridge" class="text-white" :size="isDesktop ? '24' : '18'" />
        </div>
      </div>
      <div class="to-network w-1/2">
        <ChooseNetworkBridge type="TO" @select-network="handleSelectToNetwork" />
      </div>
    </div>
    <div class="mt-3 w-full sm:mt-4">
      <InputBridge
        v-model:amount="form.amount"
        :is-selected="isTokenSelected"
        :token="form.token"
        :balance="balance0.toString()"
        :step-bridge
        :disabled-input="!form.token.symbol"
        class="h-[138px] w-full border border-[#EEEEEE] bg-white sm:h-[100px]"
        @select-token="handleOpenPopupSelectToken"
        @change="handleInput"
      />
    </div>

    <!-- <div class="mt-6 w-full sm:mt-5">
      <div class="flex w-full rounded-tl-lg rounded-tr-lg bg-[#FAFAFA] px-8 pb-7 pt-3 shadow sm:px-3 sm:pb-5">
        <div class="flex flex-col">
          <p class="mb-4 text-sm text-primary sm:mb-2 sm:text-xs">From network</p>
          <div class="flex items-center gap-2 rounded-lg">
            <span class="overflow-hidden text-ellipsis text-base font-semibold sm:text-xs">
              {{ fromNetwork?.network }}
            </span>
          </div>
        </div>
        <BaseIcon v-if="isDesktop" name="arrow-line-horizontal" size="116" class="arrow-horizontal mx-4 max-h-8" />
        <BaseIcon v-else name="arrow-line-horizontal-mobile" size="48" class="arrow-horizontal mx-3 max-h-8" />
        <div class="flex flex-col">
          <p class="mb-4 text-sm text-primary sm:mb-2 sm:text-xs">To network</p>
          <div class="flex items-center gap-2 rounded-lg">
            <span class="overflow-hidden text-ellipsis text-base font-semibold sm:text-xs">
              {{ toNetwork?.network }}
            </span>
          </div>
        </div>
      </div>
      <div class="w-full rounded-bl-lg rounded-br-lg border-t border-[#EEEEEE] bg-[#FAFAFA] px-8 pb-7 pt-3 shadow sm:px-3 sm:pb-5">
        <div class="flex flex-col">
          <p class="mb-1 text-primary sm:mb-2 sm:text-sm">Send</p>
          <div class="flex items-center justify-between gap-2 rounded-lg bg-[#FAFAFA]">
            <div class="flex items-center gap-1">
              <p class="overflow-hidden text-ellipsis text-[22px] font-semibold leading-[28px] sm:text-base">
                {{ form.token.tokenSymbol }}
              </p>
            </div>
            <div class="flex flex-col">
              <p class="text-[32px] font-semibold leading-[28px] text-primary sm:text-[22px]">{{ amountOut }}</p>
            </div>
          </div>
        </div>
      </div>
    </div> -->

    <div class="mt-3 w-full rounded-lg border border-dashed border-gray-4 px-8 py-4 sm:mt-4 sm:px-4 sm:pt-3">
      <div class="flex justify-between">
        <span class="text-sm text-primary"> You Receive </span>
        <div v-if="token1 !== undefined && form.token?.address" class="flex flex-col gap-1 text-right">
          <p class="receive">{{ amountOut }}</p>
          <div v-if="toNetwork?.chainId" class="flex items-center gap-1">
            <img src="/public/logo.png" alt="logo" class="size-4 rounded-full" />
            <span class="text-sm">{{ form.token.symbol || '' }}</span>
            <a v-if="checkNativeToken(toNetwork, token1)" :href="`${URL_SCAN[toNetwork.chainId].token}/${token1.address}`" target="_blank">
              <span class="line-clamp-1 text-xs text-[#6F6A79]"> ({{ formatAddress(token1.address) }}) </span>
            </a>
          </div>
        </div>
      </div>
      <div class="mt-5 flex justify-between">
        <span class="text-sm text-primary"> Est. time </span>
        <span class="text-sm font-medium text-primary"> ≈ 12 seconds </span>
      </div>
      <div class="mt-3 flex justify-between">
        <span class="text-sm text-primary"> Fee </span>
        <div v-if="fee.network !== '0' || fee.protocol !== '0' || fee.bridge !== '0'" class="text-end text-sm font-medium text-primary">
          <span>{{ fee.network }} {{ fee.networkSymbol }}</span> + <span>{{ fee.protocol }} {{ fee.protocolSymbol }}</span> +
          <el-tooltip popper-class="tooltip-fee-bridge" append-to="body" placement="top-end" effect="light">
            <template #content>
              <div class="flex flex-col gap-2">
                <div v-if="fee.protocol" class="flex justify-between">
                  <span class="text-sm text-[#6E6E6E]">Protocol Fee</span>
                  <span class="text-sm text-[#1C1C1C]">{{ fee.protocol }} {{ fee.protocolSymbol }}</span>
                </div>
                <div v-if="fee.bridge" class="flex justify-between">
                  <span class="text-sm text-[#6E6E6E]">deBridge Fee</span>
                  <span class="text-sm text-[#1C1C1C]">{{ fee.bridge }} {{ fee.bridgeSymbol }}</span>
                </div>
                <div v-if="fee.network" class="flex justify-between">
                  <span class="text-sm text-[#6E6E6E]">Market Maker Gas</span>
                  <span class="text-sm text-[#1C1C1C]">{{ fee.network }} {{ fee.networkSymbol }}</span>
                </div>
              </div>
            </template>
            <span class="border-b border-dashed border-gray-4">{{ fee.bridge }} {{ fee.bridgeSymbol }}</span>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- <template v-if="isQuoteExist">
      <InfoSwap v-model:edit-slippage="isEditSlippage" :step-swap />
    </template> -->

    <template v-if="!isEditSlippage">
      <button
        v-if="isConnected"
        :disabled="isDisabledButton"
        class="bg-linear mt-3 flex h-[67px] items-center justify-center gap-2 rounded-lg text-xl font-semibold text-white hover:opacity-90 sm:mt-4 sm:h-[42px] sm:text-sm"
        :class="{ 'bg-gray pointer-events-none cursor-default': isSwapping || isConfirmApprove || isConfirmSwap, 'btn-disabled': isDisabledButton }"
        @click="onCLickBridge"
      >
        <BaseLoadingButton v-if="isFetchQuote || isSwapping || isConfirmApprove || isConfirmSwap" />
        <span>{{ msgButton }}</span>
      </button>
      <button
        v-else
        class="bg-linear mt-3 flex h-[67px] items-center justify-center gap-2 rounded-lg text-xl font-semibold text-white hover:opacity-90 sm:mt-4 sm:h-[42px] sm:text-sm"
        @click="setOpenPopup('popup-connect')"
      >
        <template v-if="isFetchQuote">
          <BaseLoadingButton />
          <span>{{ msgButton }}</span>
        </template>
        <template v-else>
          <BaseIcon name="wallet" size="24" class="text-white" />
          <span class="uppercase">Connect Wallet</span>
        </template>
      </button>
    </template>

    <PopupSellToken :list-token="listTokenFrom" @select="handleSelectToken" />
  </div>
</template>

<script lang="ts" setup>
  import { useAccount, useSwitchChain } from '@wagmi/vue'
  import { type Address, type Hex, createPublicClient, encodeFunctionData, http, pad, parseUnits, zeroAddress, zeroHash } from 'viem'
  import { computed } from 'vue'

  import { readContract, sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  // import { monTestnet } from '~/utils/config/chains'
  // import { mainnet, sepolia } from '@wagmi/core/chains'
  import ABI_RELAY_FACET from '@/constant/abi/RelayFacet.json'

  import { ElNotification } from 'element-plus'
  import ABI_TOKEN from '~/constant/contract/contract-token.json'
  import type { ChainId, INetwork, IToken } from '~/types'
  import PopupSellToken from '../popup/PopupSellToken.vue'
  import ChooseNetworkBridge from './ChooseNetworkBridge.vue'
  import InputBridge from './InputBridge.vue'
  // import { useBridgeTransaction } from '~/composables/useBridgeTransaction'
  // import HeaderFormSwap from './HeaderFormSwap.vue'
  // import { SwapRouter, type SwapOptions } from '~/composables/swapRouter'
  // import { CONTRACT_ADDRESS, MAX_NUMBER_APPROVE } from '~/constant/contract'
  import { type Route, type V3Pool } from '@monchain/smart-router'
  import { Token, TradeType } from '@monchain/swap-sdk-core'
  import Decimal from 'decimal.js'
  // import swapRouterABI from "~/constant/abi/swapRouter.json";
  import { EXPLORER_NAME, URL_SCAN } from '~/config/scan'
  import { config } from '~/config/wagmi'
  import { MAX_NUMBER_APPROVE } from '~/constant'
  import { CHAINS } from '~/utils/config/chains'

  export type StepBridge = 'SELECT_TOKEN' | 'CONFIRM_BRIDGE' | 'APPROVE_TOKEN'

  interface IProps {
    title?: string
  }

  type RouteInput = {
    tokenInAddress: string
    tokenOutAddress: string
    fee: number
    amountOut: number
    amountInMaximum: number
    sqrtPriceLimitX96: number
  }

  type _Response = {
    data: {
      requestId: string
      signature: string
      iterator: string
    }
    meta: {
      httpStatusCode: number
      code: string
      message: string
    }
  }

  const _props = withDefaults(defineProps<IProps>(), {
    title: 'Bridge'
  })

  const { setOpenPopup } = useBaseStore()
  const { isDesktop } = storeToRefs(useBaseStore())
  const { fee, fromNetwork, toNetwork, form, isConfirmSwap, isConfirmApprove, isSwapping, listToken, token0, token1, balance0, listNetwork, listTokenFrom } =
    storeToRefs(useBridgeStore())
  const isEditSlippage = ref(false)

  // const approveAndSend = ref<boolean>(false)
  const { isConnected, address, address: receiverAddress } = useAccount()
  const { switchChain } = useSwitchChain()
  const { approveToken } = useApproveToken()

  const stepBridge = ref<StepBridge>('SELECT_TOKEN')

  // const bestTrade = ref<SwapOutput | undefined>(undefined)
  const isFetchQuote = ref(false)
  const needAllowanceApprove = ref(true)
  const needAllowanceApproveProtocolFee = ref(true)
  const isTokenSelected = computed(() => !!form.value.token?.tokenSymbol)
  const notEnoughLiquidity = ref(false)
  const insufficientBalance = ref(false)
  const amountOut = ref('')

  /*
   * Message button
   * case 1: Select a token
   * case 2: Enter an amount
   * case 3: Finalizing quote...
   * case 4: Swap {sellAmount} {token0.symbol} ⇒ {buyAmount} {token1.symbol}
   * case 7: APPROVE AND SWAP
   * case 6: CONFIRM IN WALLET
   * case 5: SWAPPING! PLEASE WAIT..
   */
  const msgButton = computed(() => {
    if (isSwapping.value) {
      return 'SWAPPING! PLEASE WAIT..'
    } else if (!isTokenSelected.value) {
      return 'Select a token'
    } else if (isFetchQuote.value) {
      return 'Finalizing quote...'
    } else if (insufficientBalance.value) {
      return 'You have insufficient balance'
    } else if ((isFetchQuote.value && !isTokenSelected.value) || notEnoughLiquidity.value) {
      return 'Insufficient liquidity for this trade'
    } else if (isTokenSelected.value) {
      if (stepBridge.value === 'SELECT_TOKEN') {
        return `SEND ${form.value.amount} ${form.value.token.symbol || ''}: ${fromNetwork.value?.network} ⇒ ${toNetwork.value?.network}`
      } else {
        if (isSwapping.value) {
          return 'SWAPPING! PLEASE WAIT..'
        } else {
          if (stepBridge.value === 'APPROVE_TOKEN') {
            if (needAllowanceApprove.value) {
              if (isConfirmApprove.value) {
                return `APPROVING ${token0.value?.symbol} IN WALLET`
              } else {
                return `APPROVE ${token0.value?.symbol}`
              }
            } else if (needAllowanceApproveProtocolFee.value) {
              if (isConfirmApprove.value) {
                return `APPROVING ${fee.value?.protocolSymbol} IN WALLET`
              } else {
                return `APPROVE ${fee.value?.protocolSymbol}`
              }
            }
          }
          return isConfirmApprove.value || isConfirmSwap.value ? 'CONFIRM IN WALLET' : 'APPROVE AND SWAP'
        }
      }
    } else {
      return 'Enter an amount'
    }
  })

  const isDisabledButton = computed(() => {
    return !isTokenSelected.value || !+form.value.amount || isFetchQuote.value || notEnoughLiquidity.value || insufficientBalance.value
  })

  const handleSwapOrder = () => {
    if (stepBridge.value === 'CONFIRM_BRIDGE') return // @ts-ignore
    ;[fromNetwork.value, toNetwork.value] = [toNetwork.value, fromNetwork.value]
    handleSelectToNetwork()
  }

  const handleOpenPopupSelectToken = () => {
    if (stepBridge.value === 'CONFIRM_BRIDGE') return
    setOpenPopup('popup-sell-token', true)
    console.info('tokens: ', listTokenFrom.value)
  }

  async function handleSelectToNetwork() {
    if (!fromNetwork.value) {
      console.error('Not found source network')
      return
    }
    // ElMessage.success(`Switch to ${fromNetwork.value.network}`)
    useBridgeStore().resetStore()
    switchChain({ chainId: fromNetwork.value?.chainId })
    form.value.token = {} as IToken
    balance0.value = 0
    form.value.amount = ''
    amountOut.value = ''
    fee.value.network = '0'
    fee.value.protocol = '0'
    fee.value.bridge = '0'
  }

  const restoreFee = () => {
    fee.value.bridge = '0'
    fee.value.protocol = '0'
    fee.value.network = '0'
  }

  /**
   * token0: token from network A
   * token1: token from network B
   * stableTokenInDestinationChain: stable token in destination chain
   *
   * VD: swap token ORB  from MONCHAIN to BSC
   * token0: ORB in MONCHAIN
   * token1: ORB in BSC
   * stableTokenInDestinationChain: USDT in BSC
   *
   * In case:
   * Nếu token0 là stable token thì không cần gọi best-route và best-trade
   * => Gọi API get fee
   * => Check allowance
   * => Call to bridge contract với routes = []
   *
   */
  const handleInput = async (amount: string) => {
    console.log('handle input', amount)

    try {
      restoreFee()
      amountOut.value = ''
      notEnoughLiquidity.value = false
      insufficientBalance.value = false
      if (!isTokenSelected.value) return
      isFetchQuote.value = true
      if (!amount) {
        isFetchQuote.value = false
        form.value.amount = ''
        isEditSlippage.value = false
        // slippage.value = DEFAULT_SLIPPAGE
        return
      }

      const amountInWei = parseUnits(amount, token1.value!.decimals)
      if (parseUnits(String(balance0.value!), token1.value!.decimals) < amountInWei) {
        console.log('balance0', balance0.value)
        // notEnoughLiquidity.value = true
        insufficientBalance.value = true
      }
      form.value.amount = amount

      console.log('token0', token0.value)
      console.log('token1', token1.value)
      console.log('amountInWei', amountInWei)

      const stableTokenInSourceChain = listTokenFrom.value.find((token) => token.stable && token.chainId === fromNetwork.value?.chainId)
      const nativeTokenInSourceChain = listTokenFrom.value.find((token) => token.address === zeroAddress && token.chainId === fromNetwork.value?.chainId)
      const stableTokenInDestinationChain = listToken.value.find((token) => token.stable && token.chainId === toNetwork.value?.chainId)
      const nativeTokenInDestinationChain = listToken.value.find((token) => token.address === zeroAddress && token.chainId === toNetwork.value?.chainId)
      if (!nativeTokenInSourceChain || !stableTokenInSourceChain || !stableTokenInDestinationChain || !nativeTokenInDestinationChain) {
        isFetchQuote.value = false
        !nativeTokenInSourceChain && console.error('No native token in source chain')
        !stableTokenInSourceChain && console.error('No stable token in source chain')
        !nativeTokenInDestinationChain && console.error('No native token in destination chain')
        !stableTokenInDestinationChain && console.error('No stable token in destination chain')
        return
      }
      if (!token0.value || !token1.value || !toNetwork.value || !fromNetwork.value) {
        isFetchQuote.value = false
        !token0.value && console.error('No token0 value')
        !token1.value && console.error('No token1 value')
        !toNetwork.value && console.error('No toNetwork value')
        !fromNetwork.value && console.error('No fromNetwork value')
        return
      }

      if (token0.value?.address === stableTokenInSourceChain?.address) {
        console.log('[Bridge] token0 is stable token', stableTokenInDestinationChain)
        bridgeBody.value = buildBodyForBridge([], amountInWei)
        amountOut.value = Decimal(amount).toFixed()
        fee.value.bridge = '0'
        fee.value.bridgeSymbol = token0.value?.symbol || ''
        stepBridge.value = 'SELECT_TOKEN'
        await calculateFee(bridgeBody.value, nativeTokenInSourceChain, stableTokenInDestinationChain)
      } else {
        let currencyA: Token
        let currencyB: Token
        if (token1.value?.address === zeroAddress) {
          // Incase:
          /**
           * Nếu Token1 (token_to) là đồng native thì gọi best-trade với:
           *  - currencyA: Stable token in source chain (VD: USDT in MONCHAIN)
           *  - currencyB: Wrap native token in destinationchain (VD: WBNB in BSC)  => Lấy từ list network_to
           *  - TradeType: EXACT_OUTPUT
           */
          currencyA = new Token(
            stableTokenInDestinationChain.chainId as ChainId,
            stableTokenInDestinationChain.address as `0x${string}`,
            +stableTokenInDestinationChain.decimals,
            stableTokenInDestinationChain.symbol,
            stableTokenInDestinationChain.name
          )
          currencyB = new Token(
            toNetwork.value.chainId as ChainId,
            toNetwork.value.wrapTokenAddress as `0x${string}`,
            +nativeTokenInDestinationChain.decimals,
            toNetwork.value.wrapToken, // Symbol
            toNetwork.value.wrapToken // Name
          )
        } else {
          // Incase:
          /**
           * Nếu Token1 (token_to) không phải là đồng native thì gọi best-trade với:
           *  - currencyA: stable token in destination chain (VD: USDT in BSC)
           *  - currencyB: Token1 (token_to)
           *  - TradeType: EXACT_OUTPUT
           */
          currencyA = new Token(
            stableTokenInDestinationChain.chainId as ChainId,
            stableTokenInDestinationChain.address as `0x${string}`,
            +stableTokenInDestinationChain.decimals,
            stableTokenInDestinationChain.symbol,
            stableTokenInDestinationChain.name
          )
          currencyB = token1.value
        }

        /**
         * Swap BNB from MONCHAIN to BSC
         * currencyA: USDT in BSC
         * currencyB: WBNB in BSC
         * => Gọi V4Router.getBestTrade với:
         *  - amount: amountInWei
         *  - currencyA: USDT in BSC
         *  - currencyB: WBNB in BSC
         *  - tradeType: EXACT_OUTPUT
         */
        console.log('currencyA', currencyA)
        console.log('currencyB', currencyB)

        const _trade = await getBestTradeV4({
          token0: currencyA,
          token1: currencyB,
          inputAmount: Number(amountInWei),
          type: TradeType.EXACT_OUTPUT,
          chainId: toNetwork.value!.chainId
        })
        console.log('>>> / _trade:', _trade)
        if (!_trade) {
          console.error('No trade found')
          return
        }
        // TODO: Check lai cho nay nhe
        if (!_trade.routes.length) {
          console.error('No route found')
          return
        }
        const outputAmount = _trade.routes[0].outputAmount
        const BASE_FEE_PERCENT = 10 ** 6
        let feeBridge = 0
        let remainAmountOut = 0n

        for (const route of _trade.routes) {
          for (const pool of route.pools) {
            if (!('fee' in pool)) {
              throw new Error('Fee should not be in pool')
            }
            feeBridge += (Number(pool?.fee || 0) / BASE_FEE_PERCENT) * Number(outputAmount.numerator / outputAmount.denominator)
            if ('reserve0' in pool && pool.reserve0?.currency.address === currencyB.address) {
              remainAmountOut += BigInt(pool.reserve0?.numerator ?? 0) / BigInt(pool.reserve0?.denominator ?? 1)
            } else if ('reserve1' in pool && pool.reserve1?.currency.address === currencyB.address) {
              remainAmountOut += BigInt(pool.reserve1?.numerator ?? 0) / BigInt(pool.reserve1?.denominator ?? 1)
            }
          }
        }
        console.info(' ~ FormBridge.client.vue:491 ~ remainAmountOut:', remainAmountOut)
        if (remainAmountOut <= amountInWei) {
          notEnoughLiquidity.value = true
          return
        }

        fee.value.bridge = Decimal(feeBridge)
          .div(10 ** token0.value!.decimals)
          .toFixed()
        fee.value.bridgeSymbol = token0.value?.symbol || '---'
        bridgeBody.value = buildBodyForBridge(_trade.routes, _trade.inputAmount.numerator / _trade.inputAmount.denominator)
        amountOut.value = Decimal(outputAmount.toSignificant(token0.value!.decimals)).sub(Decimal(fee.value.bridge)).toFixed()
        await calculateFee(bridgeBody.value, nativeTokenInSourceChain, stableTokenInDestinationChain)
        //

        if (token0.value?.address === zeroAddress) {
          needAllowanceApprove.value = false
          return
        }
      }
      //
      //  Check allowance
      //
      console.log('>>> / Check allowance')
      const allowance = (await readContract(config, {
        abi: ABI_TOKEN,
        address: token0.value?.wrapped.address as `0x${string}`,
        functionName: 'allowance',
        args: [address.value, getLifiContractAddress()]
      })) as bigint
      console.log('>>> /Check allowance > allowance:', allowance)
      if (BigInt(allowance) < BigInt(amountInWei)) {
        needAllowanceApprove.value = true
      } else {
        needAllowanceApprove.value = false
      }
    } catch (_error) {
      console.error('🚀 ~ handleInput ~ _error:', _error)
      isFetchQuote.value = false
      notEnoughLiquidity.value = true
    } finally {
      isFetchQuote.value = false
    }
  }
  const calculateFee = async (_bridgeBody: typeof bridgeBody.value, nativeTokenInSourceChain: IToken, stableTokenInDestinationChain: IToken) => {
    // Get fee
    type FeeInfo = {
      data: {
        feeNetwork: number
        feeProtocolAmount: number
        feeProtocolDecimals: number
        feeProtocolToken: string
      }
    }
    try {
      const getFeeRs = await $fetch<FeeInfo>('/api/bridge/fee', {
        method: 'POST',
        body: JSON.stringify(_bridgeBody)
      })
      console.log('>>> / getFeeRs:', getFeeRs)
      const { feeNetwork, feeProtocolAmount, feeProtocolDecimals, feeProtocolToken } = getFeeRs.data
      // TODO: update 18 to native token fromNetwork decimals
      fee.value.network = Decimal(feeNetwork || 0)
        .div(10 ** 18)
        .toFixed()
      fee.value.networkSymbol = nativeTokenInSourceChain.symbol
      fee.value.networkDecimals = nativeTokenInSourceChain.decimals
      fee.value.protocol = Decimal(feeProtocolAmount || 0)
        .div(10 ** feeProtocolDecimals)
        .toSignificantDigits(feeProtocolDecimals)
        .toFixed()
      fee.value.protocolSymbol = stableTokenInDestinationChain.tokenSymbol
      fee.value.feeProtocolToken = feeProtocolToken

      console.log('>>> / Check allowance protocol fee')
      if (feeProtocolToken === zeroAddress) {
        needAllowanceApproveProtocolFee.value = false
        return
      }
      const allowanceProtocolFee = (await readContract(config, {
        abi: ABI_TOKEN,
        address: feeProtocolToken as `0x${string}`,
        functionName: 'allowance',
        args: [address.value, getLifiContractAddress()]
      })) as bigint
      console.log('>>> /Check allowance > allowance:', allowanceProtocolFee)
      if (BigInt(allowanceProtocolFee) < BigInt(feeProtocolAmount)) {
        needAllowanceApproveProtocolFee.value = true
      } else {
        needAllowanceApproveProtocolFee.value = false
      }
    } catch (e) {
      console.error('Call estimate fee fail: ', e)
      bridgeError('Estimate gas failed', `Can't estimate fee using to transfer token, please reload and try again.`)
    }
  }

  const bridgeBody = ref<ReturnType<typeof buildBodyForBridge> | null>(null)
  /**
   * @param bestTradeRoutes
   * ```ts
   * const bestTradeRoutes = _trade.routes
   * ```
   * @param amountIn
   * ```ts
   * const amountInWei = _trade.inputAmount.toExact()
   * ```
   */
  function buildBodyForBridge(bestTradeRoutes: Route[], amountInWei: bigint) {
    const routes: RouteInput[] = []
    for (let i = 0; i < bestTradeRoutes.length; i++) {
      const route = bestTradeRoutes[i]

      const liquidity = (route.pools[0] as V3Pool).liquidity.toString()
      const sqrtRatioX96 = (route.pools[0] as V3Pool).sqrtRatioX96
      const currentPrice = new Decimal(sqrtRatioX96.toString()).div(new Decimal(2).pow(96)).pow(2)

      const zeroToOne = route.path[0].wrapped.sortsBefore(route.path[1].wrapped)
      let nextPrice: Decimal = new Decimal(0)
      if (zeroToOne) {
        // √(Pnew) = L / ( (L/√(Pcurrent)) + Δx )
        nextPrice = new Decimal(liquidity).div(new Decimal(liquidity).div(currentPrice.sqrt()).add(amountInWei.toString())).pow(2)
      } else {
        // √(Pnew) = (Δy / L) + √(Pcurrent)
        nextPrice = new Decimal(amountInWei.toString()).div(new Decimal(liquidity)).add(currentPrice.sqrt()).pow(2)
      }
      const sqrtPriceLimitX96 = nextPrice
        .sqrt()
        .mul(2 ** 96)
        .toNumber()

      routes.push({
        tokenInAddress: route.inputAmount.currency.wrapped.address,
        tokenOutAddress: route.outputAmount.currency.wrapped.address,
        fee: (route.pools[0] as V3Pool).fee as number,
        amountOut: Number(route.outputAmount.numerator / route.outputAmount.denominator),
        amountInMaximum: Number(route.inputAmount.numerator / route.inputAmount.denominator),
        sqrtPriceLimitX96: sqrtPriceLimitX96
      })
    }
    // Call to bridge contract
    const lifiContractAddress = getLifiContractAddress()
    return {
      contractAddress: lifiContractAddress,
      chainId: fromNetwork.value!.chainId,
      destinationChainId: toNetwork.value!.chainId as number,
      receiverAddress: receiverAddress.value,
      sendingAssetId: token0.value?.address as `0x${string}`,
      receiverAssetId: token1.value?.address as `0x${string}`,
      amountIn: Number(amountInWei),
      routes
    }
  }
  /**
   * Get lifi contract address from FROM_NETWORK
   */
  const getLifiContractAddress = () => {
    const lifiContractAddress = listNetwork.value.find((item) => item.chainId === fromNetwork.value?.chainId)?.lifiContractAddress as `0x${string}`
    if (!lifiContractAddress) {
      throw new Error('Invalid lifi contract address')
    }
    return lifiContractAddress
  }

  const handleSelectToken = (token: IToken) => {
    form.value.token = token
    balance0.value = 0
    amountOut.value = ''
  }

  const handleApprove = async () => {
    try {
      isConfirmApprove.value = true
      if (needAllowanceApprove.value) {
        await approveToken(token0.value?.address as string, getLifiContractAddress(), MAX_NUMBER_APPROVE, (status) => {
          if (status === 'SUCCESS') {
            needAllowanceApprove.value = false
            isConfirmApprove.value = false

            // if allowed fee => execute contract
            if (!needAllowanceApproveProtocolFee.value) {
              stepBridge.value = 'CONFIRM_BRIDGE'
              handleSwap()
            }
          }
        })
      } else if (needAllowanceApproveProtocolFee.value) {
        await approveToken(fee.value.feeProtocolToken, getLifiContractAddress(), MAX_NUMBER_APPROVE, (status) => {
          if (status === 'SUCCESS') {
            needAllowanceApproveProtocolFee.value = false
            isConfirmApprove.value = false

            // if allowed token => execute contract
            if (!needAllowanceApprove.value) {
              stepBridge.value = 'CONFIRM_BRIDGE'
              handleSwap()
            }
          }
        })
      }
    } catch (error) {
      console.error('Approve failed:', error)
      bridgeError('Approve token failed', '')
      stepBridge.value = 'SELECT_TOKEN'
      isConfirmApprove.value = false
    } finally {
      //
    }
  }

  const handleSwap = async () => {
    try {
      isSwapping.value = true
      if (!bridgeBody.value) {
        console.error('No bridge body')
        return
      }
      const swapResult = await $fetch('/api/bridge/sign/relay-transfer', {
        method: 'POST',
        body: JSON.stringify(bridgeBody.value)
      })
      console.info('🚀 ~ handleSwap ~ swapResult:', swapResult)
      console.log('BODY', bridgeBody.value)

      // Call to lifi contract
      const bridgeData = {
        transactionId: swapResult.data.requestId, // Kiểu dữ liệu string
        bridge: 'relay' as const, // Hằng số kiểu string
        integrator: swapResult.data.iterator as string, // Định rõ kiểu dữ liệu
        referrer: zeroAddress, // Định rõ kiểu Address
        sendingAssetId: (token0.value?.address || zeroAddress) as Address,
        receiver: receiverAddress.value,
        minAmount: parseUnits(form.value.amount.toString(), +form.value.token.tokenDecimals),
        destinationChainId: toNetwork.value?.chainId as number, // Chắc chắn kiểu số
        hasSourceSwaps: false,
        hasDestinationCall: false
      }
      const relayData = {
        requestId: swapResult.data.requestId as string,
        nonEVMReceiver: zeroHash, // Định rõ kiểu Hex
        receivingAssetId: pad(token1.value!.address, { size: 32 }), // Kiểu Address
        signature: swapResult.data.signature as Hex // Định rõ kiểu Hex
      }

      const feeData = {
        feeProtocolAmount: BigInt(swapResult.data.feeProtocol),
        feeNetworkAmount: BigInt(swapResult.data.feeNetwork)
      }

      const publicClientFrom = createPublicClient({
        chain: CHAINS[fromNetwork.value!.chainId],
        transport: http(fromNetwork.value!.rpc),
        batch: {
          multicall: {
            batchSize: 1024 * 200
          }
        }
      })
      const gasEstimate = await publicClientFrom.getGasPrice()
      const datas = [bridgeData, relayData, feeData]
      console.log('>>> / bridgeData, relayData:', datas)

      const calldata = encodeFunctionData({
        abi: ABI_RELAY_FACET,
        functionName: 'startBridgeTokensViaRelay',
        args: datas
      })

      // Nếu trường hợp FROM là đồng Native thì mới truyền amount vào value
      // Nếu không thì truyền 0
      const value = token0.value?.address === zeroAddress ? BigInt(Number(form.value.amount) * 10 ** +token0.value.decimals) : BigInt(0)
      const valueWithFee = BigInt(value.toString()) + BigInt(swapResult.data.feeNetwork)

      const txHash = await sendTransaction(config, {
        to: getLifiContractAddress(),
        data: calldata,
        value: valueWithFee, // value = value + fee network
        gas: BigInt(300000), // Định kiểu BigInt
        gasPrice: gasEstimate as bigint // Đảm bảo kiểu bigint
      })

      const { status } = await waitForTransactionReceipt(config, {
        hash: txHash,
        pollingInterval: 2000
      })

      if (status === 'success') {
        const tnxScan = `${URL_SCAN[fromNetwork.value!.chainId].tx}/${txHash}`
        bridgeSuccess(+form.value.amount, token0.value?.symbol || '', +form.value.amount, tnxScan)
        useBridgeStore().resetStore()
        amountOut.value = ''
        stepBridge.value = 'SELECT_TOKEN'
      }

      isFetchQuote.value = false
    } catch (error) {
      console.error('Transaction failed:', error)
      bridgeError('Bridge swapping failed', 'Bridge swapping failed, please reload and try again.')
    } finally {
      isSwapping.value = false
    }
  }

  const onCLickBridge = async () => {
    if (needAllowanceApprove.value || needAllowanceApproveProtocolFee.value) {
      stepBridge.value = 'APPROVE_TOKEN'
      await handleApprove()
    } else {
      await handleSwap()
    }
  }

  const bridgeSuccess = (amount: number, token: string, value: number, explorerLink: string) => {
    const message = `
          <p>${amount} ${token} ⇒ ${value} ${token}.</p>
          <p>View on <a style="text-decoration: underline;" href="${explorerLink}" target="_blank" rel="noopener noreferrer">${EXPLORER_NAME[fromNetwork.value!.chainId]}</a></p>
      `
    // const isMobile = window.innerWidth <= 768
    ElNotification({
      title: 'Bridge swapping successfully',
      dangerouslyUseHTMLString: true,
      message: message,
      type: 'success',
      customClass: 'notification-bridge-success',
      position: isDesktop.value ? 'top-right' : 'bottom-right'
    })
  }

  const bridgeError = (title: string, message: string) => {
    // const isMobile = window.innerWidth <= 768
    ElNotification({
      title: title,
      dangerouslyUseHTMLString: true,
      message: message,
      type: 'error',
      customClass: 'notification-bridge-error',
      position: isDesktop.value ? 'top-right' : 'bottom-right'
    })
  }

  const checkNativeToken = (toNetwork: INetwork, token: Token) => {
    if (toNetwork.chainId === token.chainId) {
      return token.address !== '0x0000000000000000000000000000000000000000'
    }
  }
  const { listToken: listTokenCurrentNetwork } = storeToRefs(useBaseStore())
  onMounted(() => {
    console.log(listToken.value, 'list token')

    const tokenDefault = listTokenCurrentNetwork.value.find((item) => item?.symbol === 'MON') as IToken
    if (tokenDefault) {
      form.value.token = tokenDefault
    }
    balance0.value = 0
  })
</script>

<style scoped lang="scss">
  :deep(.popper-hover-fee) {
    --el-popover-border-radius: 9px;
    --el-popover-padding: 12px 24px 16px;
  }
  .receive {
    height: 28px;
    font-size: 22px;
    font-weight: 600;
    text-align: right;
    background: linear-gradient(91deg, #790c8b 60%, #1573fe 98%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    overflow: hidden;
  }
  :deep(.arrow-horizontal) {
    svg {
      @apply mt-11 !h-[unset] !w-[unset] sm:mt-7;
    }
  }
</style>

<style lang="scss">
  .notify-swap {
    padding: 16px;
    border-radius: 8px;
    .el-notification__group {
      margin: 0dvb;
    }
    .el-icon.el-notification__closeBtn {
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
      color: var(--color-primary);
    }
  }
  .tooltip-fee-bridge {
    @apply min-w-[320px] rounded-lg px-6 py-3;
  }

  .notification-bridge-success {
    background-color: #e8ffeb;
    padding: 20px 16px;
    .el-notification__title {
      font-size: 14px;
      font-weight: 600;
      color: #000000;
    }
    .el-notification__content {
      font-size: 14px;
      color: #000000;
    }
  }

  .notification-bridge-error {
    background-color: #ffe8ea;
    padding: 20px 16px;
    .el-notification__title {
      font-size: 14px;
      font-weight: 600;
      color: #a60202;
    }
    .el-notification__content {
      font-size: 14px;
      color: #a60202;
    }
  }
</style>
