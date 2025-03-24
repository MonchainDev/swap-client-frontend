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
        class="h-[138px] w-full border border-[#EEEEEE] bg-white sm:h-[100px]"
        @select-token="handleOpenPopupSelectToken"
        @change="handleInput"
      />
    </div>

    <div class="mt-6 w-full sm:mt-5">
      <div class="flex w-full rounded-tl-lg rounded-tr-lg bg-[#FAFAFA] px-8 pb-7 pt-3 shadow sm:px-3 sm:pb-5">
        <div class="flex flex-col">
          <p class="mb-4 text-sm text-primary sm:mb-2 sm:text-xs">From network</p>
          <div class="flex items-center gap-2 rounded-lg">
            <!-- <img :src="fromNetwork?.logo" alt="logo" class="size-7 rounded-lg sm:size-5" /> -->
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
            <!-- <img :src="fromNetwork?.logo" alt="logo" class="size-7 rounded-lg sm:size-5" /> -->
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
              <!-- <img :src="form.token.icon_url" alt="logo" class="size-7 rounded-lg sm:size-5" /> -->
              <p class="overflow-hidden text-ellipsis text-[22px] font-semibold leading-[28px] sm:text-base">
                {{ form.token.tokenSymbol }}
              </p>
            </div>
            <div class="flex flex-col">
              <p class="text-[32px] font-semibold leading-[28px] text-primary sm:text-[22px]">{{ amountOut }}</p>
              <p class="text-sm font-semibold text-gray-6">≈ 0.02</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3 w-full rounded-lg border border-dashed border-gray-4 px-8 py-4 sm:mt-4 sm:px-4 sm:pt-3">
      <div class="flex justify-between">
        <span class="text-sm text-primary"> You Receive </span>
        <div class="flex flex-col gap-1 text-right">
          <p class="receive">0.0</p>
          <div class="flex items-center gap-1">
            <img src="/public/logo.png" alt="logo" class="size-4 rounded-full" />
            <span class="line-clamp-1 text-xs text-[#6F6A79]">(0x4612...A707)</span>
          </div>
        </div>
      </div>
      <div class="mt-5 flex justify-between">
        <span class="text-sm text-primary"> Est. time </span>
        <span class="text-sm font-medium text-primary"> ≈ 12 seconds </span>
      </div>
      <div class="mt-3 flex justify-between">
        <span class="text-sm text-primary"> Fee </span>
        <div class="text-end text-sm font-medium text-primary">
          <span>0.0595 BNB</span> + <span>0.00001 ETH</span> +
          <el-tooltip popper-class="tooltip-fee-bridge" append-to="body" placement="top-end" effect="light">
            <template #content>
              <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                  <span class="text-sm text-[#6E6E6E]">Protocol Fee</span>
                  <span class="text-sm text-[#1C1C1C]">0.150001 BNB</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-[#6E6E6E]">deBridge Fee</span>
                  <span class="text-sm text-[#1C1C1C]">0.00005272 ETH</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-[#6E6E6E]">Market Maker Gas</span>
                  <span class="text-sm text-[#1C1C1C]">12300.00005272</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-[#6E6E6E]">Cost</span>
                  <span class="text-sm text-[#1C1C1C]">ATOM</span>
                </div>
              </div>
            </template>
            <span class="border-b border-dashed border-gray-4">140.0 ATOM</span>
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
        @click="handleBridge"
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

    <PopupSellToken :list-token="listToken" @select="handleSelectToken" />
  </div>
</template>

<script lang="ts" setup>
  import { useAccount } from '@wagmi/vue'
  import { type Address, type Hex, createPublicClient, encodeFunctionData, http, pad, parseUnits, zeroAddress, zeroHash } from 'viem'
  import { computed } from 'vue'

  import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  // import { monTestnet } from '~/utils/config/chains'
  // import { mainnet, sepolia } from '@wagmi/core/chains'
  import ABI_RELAY_FACET from '@/constant/abi/RelayFacet.json'

  import { ElNotification } from 'element-plus'
  import contractAddress from '~/config/contracts'
  import { type ChainId, type IToken } from '~/types'
  import { type SwapOutput } from '~/utils/getBestTradeV2'
  import PopupSellToken from '../popup/PopupSellToken.vue'
  import ChooseNetworkBridge from './ChooseNetworkBridge.vue'
  import InputBridge from './InputBridge.vue'
  // import { useBridgeTransaction } from '~/composables/useBridgeTransaction'
  // import HeaderFormSwap from './HeaderFormSwap.vue'
  // import { SwapRouter, type SwapOptions } from '~/composables/swapRouter'
  // import { CONTRACT_ADDRESS, MAX_NUMBER_APPROVE } from '~/constant/contract'
  import { type Route, type SmartRouterTrade, type SubgraphProvider, type V3Pool, SmartRouter } from '@monchain/smart-router'
  import { CurrencyAmount, Token, TradeType } from '@monchain/swap-sdk-core'
  import Decimal from 'decimal.js'
  // import swapRouterABI from "~/constant/abi/swapRouter.json";
  import { GraphQLClient } from 'graphql-request'
  import { config } from '~/config/wagmi'
  import { CHAINS } from '~/utils/config/chains'

  export type StepBridge = 'SELECT_TOKEN' | 'CONFIRM_BRIDGE'

  interface IProps {
    title?: string
  }

  type RouteInput = {
    tokenInAddress: string
    tokenOutAddress: string
    fee: number
    amountOut: bigint
    amountInMaximum: bigint
    sqrtPriceLimitX96: bigint
  }

  type Response = {
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
  const { fromNetwork, toNetwork, form, isConfirmSwap, isConfirmApprove, isSwapping, listToken, token0, token1, balance0, listNetwork } =
    storeToRefs(useBridgeStore())
  const isEditSlippage = ref(false)

  // const approveAndSend = ref<boolean>(false)
  const { isConnected } = useAccount()

  const stepBridge = ref<StepBridge>('SELECT_TOKEN')

  // const bestTrade = ref<SwapOutput | undefined>(undefined)
  const isFetchQuote = ref(false)

  const isTokenSelected = computed(() => form.value.token?.tokenSymbol !== '')
  const notEnoughLiquidity = ref(false)
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
    } else if ((isFetchQuote.value && !isTokenSelected.value) || notEnoughLiquidity.value) {
      return 'You have insufficient balance'
    } else if (isTokenSelected.value) {
      if (stepBridge.value === 'SELECT_TOKEN') {
        return `SEND ${form.value.amount} ${form.value.token.network}: ${fromNetwork.value?.network} ⇒ ${toNetwork.value?.network}`
      } else {
        if (isSwapping.value) {
          return 'SWAPPING! PLEASE WAIT..'
        } else {
          return isConfirmApprove.value || isConfirmSwap.value ? 'CONFIRM IN WALLET' : 'APPROVE AND SWAP'
        }
      }
    } else {
      return 'Enter an amount'
    }
  })

  const isDisabledButton = computed(() => {
    return (
      !isTokenSelected.value ||
      !form.value.amount ||
      // !(fromNetwork.value?.network === toNetwork.value?.network) ||
      isFetchQuote.value ||
      notEnoughLiquidity.value
    )
  })

  const handleSwapOrder = () => {
    if (stepBridge.value === 'CONFIRM_BRIDGE') return
    ;[fromNetwork.value, toNetwork.value] = [toNetwork.value, fromNetwork.value]
    handleSelectToNetwork()
  }

  const handleOpenPopupSelectToken = () => {
    if (stepBridge.value === 'CONFIRM_BRIDGE') return
    setOpenPopup('popup-sell-token', true)
    console.info('tokens: ', listToken.value)
  }

  const stableDestinationChainIdToken = ref<IToken>()

  const feeBridge = 1 // 1%

  async function handleSelectToNetwork() {
    const query = { network: toNetwork.value?.network, crossChain: 'Y' }
    const { data } = await useFetch<IToken[]>('/api/network/token', { query })

    stableDestinationChainIdToken.value = data.value?.find((item) => item.stable)

    console.info('stableDestinationChainIdToken.value', stableDestinationChainIdToken.value)
  }

  const { address: receiverAddress } = useAccount()

  const handleInput = async (amount: string) => {
    console.log('handle input', amount)
    try {
      notEnoughLiquidity.value = false
      if (!isTokenSelected.value) return
      isFetchQuote.value = true
      if (!amount) {
        isFetchQuote.value = false
        form.value.amount = ''
        isEditSlippage.value = false
        // slippage.value = DEFAULT_SLIPPAGE
        return
      }

      const amountInWei = parseUnits(amount, form.value.token.tokenDecimals)
      if (new Decimal(balance0.value!).lt(new Decimal(amountInWei.toString()))) {
        console.log('balance0', balance0.value)
        // notEnoughLiquidity.value = true
      }
      form.value.amount = amount

      console.log('token0', token0.value)
      console.log('token1', token1.value)
      console.log('amountInWei', amountInWei)

      const stableTokenInDestinationChain = listToken.value.find((token) => token.stable && token.chainId === toNetwork.value?.chainId)
      if (!stableTokenInDestinationChain) {
        isFetchQuote.value = false
        console.error('No stable token in destination chain')
        return
      }
      console.log('stableTokenInDestinationChain', stableTokenInDestinationChain)
      const inputStableToken = new Token(
        stableTokenInDestinationChain.chainId as ChainId,
        stableTokenInDestinationChain.address as `0x${string}`,
        +stableTokenInDestinationChain.decimals,
        stableTokenInDestinationChain.symbol,
        stableTokenInDestinationChain.name
      )

      const v3SubgraphClient = new GraphQLClient('https://graph-bsc.monchain.info/subgraphs/name/v4')
      const _publicClient = publicClient({ chainId: toNetwork.value!.chainId })
      const getBestRoute = () =>
        SmartRouter.getV3CandidatePools({
          onChainProvider: () => _publicClient,
          subgraphProvider: () => v3SubgraphClient as SubgraphProvider,
          currencyA: inputStableToken,
          currencyB: token1.value!,
          subgraphFallback: true
        })
      const _v3Pools = await getBestRoute()
      console.log('>>> / _v3Pools:', _v3Pools)
      const poolProvider = SmartRouter.createStaticPoolProvider(_v3Pools)
      const quoteProvider = SmartRouter.createQuoteProvider({
        onChainProvider: () => _publicClient
      })
      const _inputAmount = CurrencyAmount.fromRawAmount(token1.value!, Number(amountInWei))
      console.log('>>> / _inputAmount:', _inputAmount)

      const _trade = await SmartRouter.getBestTrade(_inputAmount, inputStableToken, TradeType.EXACT_OUTPUT, {
        gasPriceWei: () => _publicClient.getGasPrice(),
        maxHops: 2,
        maxSplits: 3,
        poolProvider,
        quoteProvider,
        quoterOptimization: true,
        distributionPercent: 10
      })
      console.log('>>> / _trade:', _trade)
      if (!_trade) {
        console.error('No trade found')
        return
      }

      const routes: RouteInput[] = []
      const routesBestTrade = _trade.routes as Route[]
      for (let i = 0; i < routesBestTrade.length; i++) {
        const route = routesBestTrade[i]

        const liquidity = (route.pools[0] as V3Pool).liquidity.toString()
        const sqrtRatioX96 = (route.pools[0] as V3Pool).sqrtRatioX96
        const currentPrice = new Decimal(sqrtRatioX96.toString()).div(new Decimal(2).pow(96)).pow(2)

        const zeroToOne = route.path[0].wrapped.sortsBefore(route.path[1].wrapped)
        let nextPrice: Decimal = new Decimal(0)
        if (zeroToOne) {
          // √(Pnew) = L / ( (L/√(Pcurrent)) + Δx )
          nextPrice = new Decimal(liquidity).div(new Decimal(liquidity).div(currentPrice.sqrt()).add(trade.inputAmount.numerator.toString())).pow(2)
        } else {
          // √(Pnew) = (Δy / L) + √(Pcurrent)
          nextPrice = new Decimal(_trade.inputAmount.numerator.toString()).div(new Decimal(liquidity)).add(currentPrice.sqrt()).pow(2)
        }
        const sqrtPriceLimitX96 = nextPrice
          .sqrt()
          .mul(2 ** 96)
          .toNumber()

        routes.push({
          tokenInAddress: route.inputAmount.currency.wrapped.address,
          tokenOutAddress: route.outputAmount.currency.wrapped.address,
          fee: (route.pools[0] as V3Pool).fee as number,
          amountOut: Number(route.outputAmount.numerator),
          amountInMaximum: Number(route.inputAmount.numerator),
          sqrtPriceLimitX96: sqrtPriceLimitX96
        })
      }
      amountOut.value = _trade.outputAmount.toExact()

      // Call to bridge contract
      const lifiContractAddress = listNetwork.value.find((item) => item.chainId === fromNetwork.value?.chainId)?.lifiContractAddress as `0x${string}`
      if (!lifiContractAddress) {
        console.error('No lifi contract address')
        return
      }
      const swapResult = await $fetch('/api/bridge/sign/relay-transfer', {
        method: 'POST',
        body: {
          contractAddress: lifiContractAddress,
          chainId: fromNetwork.value.chainId,
          destinationChainId: toNetwork.value!.chainId as number,
          receiverAddress: receiverAddress.value,
          sendingAssetId: token0.value?.address as `0x${string}`,
          receiverAssetId: token1.value?.address as `0x${string}`,
          amountIn: Number(_trade.inputAmount.numerator),
          routes: routes
        }
      })

      // Call to lifi contract
      const bridgeData = {
        transactionId: swapResult.data.requestId, // Kiểu dữ liệu string
        bridge: 'relay' as const, // Hằng số kiểu string
        integrator: swapResult.data.iterator as string, // Định rõ kiểu dữ liệu
        referrer: zeroAddress, // Định rõ kiểu Address
        sendingAssetId: (form.value.token.tokenAddress || zeroAddress) as Address,
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
      const datas = [bridgeData, relayData]
      const calldata = encodeFunctionData({
        abi: ABI_RELAY_FACET,
        functionName: 'startBridgeTokensViaRelay',
        args: datas
      })

      const txHash = await sendTransaction(config, {
        to: lifiContractAddress,
        data: calldata,
        value: BigInt(form.value.amount) * BigInt(10 ** +form.value.token.tokenDecimals),
        gas: BigInt(300000), // Định kiểu BigInt
        gasPrice: gasEstimate as bigint // Đảm bảo kiểu bigint
      })

      const { status } = await waitForTransactionReceipt(config, {
        hash: txHash,
        pollingInterval: 2000
      })

      console.log(status)

      isFetchQuote.value = false
    } catch (_error) {
      console.error('🚀 ~ handleInput ~ _error:', _error)
      isFetchQuote.value = false
      notEnoughLiquidity.value = true
    } finally {
      isFetchQuote.value = false
    }
  }

  const handleSelectToken = (token: IToken) => {
    form.value.token = token
  }

  const handleBridge = async () => {
    // approveAndSend.value = !approveAndSend.value
    bridgeSuccess(15, 'ATOM', 123.566, 'https://explorer.monchain.info')

    try {
      const amount = form.value.amount as string
      // khởi tạo token0 = new Token() với thông tin token 0
      // khởi tạo token1 = new Token() với thông tin token 1
      // tạm thời lấy fee = 1%
      const outputAmountSubFee = Number(form.value.amount) * (1 - feeBridge / 100)
      const outputAmountInWei = outputAmountSubFee * 10 ** Number(form.value.token.tokenDecimals)
      const token0BestTradeInput = new Token(
        stableDestinationChainIdToken.value?.chainId as ChainId,
        stableDestinationChainIdToken.value?.tokenAddress as `0x${string}`,
        +stableDestinationChainIdToken.value!.tokenDecimals,
        stableDestinationChainIdToken.value!.tokenSymbol,
        stableDestinationChainIdToken.value?.name
      )
      console.log('token0BestTradeInput', token0BestTradeInput)

      const token1BestTradeInput = new Token(
        token1.value?.chainId as ChainId,
        (token1.value?.wrapped.address === '0x0000000000000000000000000000000000000000'
          ? toNetwork.value?.wrapTokenAddress
          : token1.value?.wrapped.address) as `0x${string}`,
        +token1.value!.decimals,
        token1.value!.symbol,
        token1.value?.name
      )
      console.log('token1BestTradeInput', token1BestTradeInput)

      const _bestTrade = (await getBestTradeV2({
        token0: token0BestTradeInput,
        token1: token1BestTradeInput,
        inputAmount: outputAmountInWei,
        type: TradeType.EXACT_OUTPUT,
        chainId: token1BestTradeInput.chainId!
      })) as SwapOutput

      console.info('_bestTrade: ', _bestTrade)

      const { address, isConnected } = useAccount()

      const routes: RouteInput[] = []
      const trade = _bestTrade as SmartRouterTrade<TradeType>
      const routesBestTrade = trade.routes as Route[]
      for (let i = 0; i < routesBestTrade.length; i++) {
        const route = routesBestTrade[i]

        const liquidity = (route.pools[0] as V3Pool).liquidity.toString()
        const sqrtRatioX96 = (route.pools[0] as V3Pool).sqrtRatioX96
        const currentPrice = new Decimal(sqrtRatioX96.toString()).div(new Decimal(2).pow(96)).pow(2)

        const zeroToOne = route.path[0].wrapped.sortsBefore(route.path[1].wrapped)
        let nextPrice: Decimal = new Decimal(0)
        if (zeroToOne) {
          // √(Pnew) = L / ( (L/√(Pcurrent)) + Δx )
          nextPrice = new Decimal(liquidity).div(new Decimal(liquidity).div(currentPrice.sqrt()).add(trade.inputAmount.numerator.toString())).pow(2)
        } else {
          // √(Pnew) = (Δy / L) + √(Pcurrent)
          nextPrice = new Decimal(trade.inputAmount.numerator.toString()).div(new Decimal(liquidity)).add(currentPrice.sqrt()).pow(2)
        }
        const sqrtPriceLimitX96 = nextPrice
          .sqrt()
          .mul(2 ** 96)
          .toNumber()

        routes.push({
          tokenInAddress: route.inputAmount.currency.wrapped.address,
          tokenOutAddress: route.outputAmount.currency.wrapped.address,
          fee: (route.pools[0] as V3Pool).fee as number,
          amountOut: route.outputAmount.numerator,
          amountInMaximum: route.inputAmount.numerator,
          sqrtPriceLimitX96: BigInt(sqrtPriceLimitX96)
        })
      }

      const body = {
        contractAddress: contractAddress.lifiContractAddress[fromNetwork.value!.chainId],
        chainId: fromNetwork.value?.chainId as number,
        destinationChainId: toNetwork.value?.chainId as number,
        receiverAddress: address,
        sendingAssetId: token0.value!.address,
        receiverAssetId: token1.value!.address,
        amountIn: +amount * 10 ** Number(form.value.token.tokenDecimals),
        routes: routes
      }

      // const response = {
      //   data: {
      //     requestId: '0x30314a504a383446423053593453414446444e58534644394242000000000000',
      //     signature: '0x43c9ddbb1db90a0d218bd5c2339ca25ff8539b92d674ef47b2344811b70d977924ee8a0defd0ff9cefaf084a6a0420715b2f0e393c16d7106ae98dd5a9889ae71c',
      //     iterator: 'SERVICE'
      //   },
      //   meta: {
      //     httpStatusCode: 200,
      //     code: 'OK',
      //     message: 'Successfully'
      //   }
      // }
      const res = (await $fetch('/api/v1/sign/relay-transfer', { body: body, method: 'POST' })) as unknown as Response
      console.info(res)
      if (res.meta.httpStatusCode !== 200) {
        // xử lý lỗi
        return
      }

      if (!isConnected.value) throw new Error('Wallet not connected')
      const liFiDiamondAddress = contractAddress.lifiContractAddress[fromNetwork.value!.chainId]
      const bridgeData = {
        transactionId: res.data.requestId, // Kiểu dữ liệu string
        bridge: 'relay' as const, // Hằng số kiểu string
        integrator: res.data.iterator as string, // Định rõ kiểu dữ liệu
        referrer: zeroAddress, // Định rõ kiểu Address
        sendingAssetId: (form.value.token.tokenAddress || zeroAddress) as Address,
        receiver: address,
        minAmount: parseUnits(form.value.amount.toString(), +form.value.token.tokenDecimals),
        destinationChainId: toNetwork.value?.chainId as number, // Chắc chắn kiểu số
        hasSourceSwaps: false,
        hasDestinationCall: false
      }
      const relayData = {
        requestId: res.data.requestId as string,
        nonEVMReceiver: zeroHash, // Định rõ kiểu Hex
        receivingAssetId: pad(token1.value!.address, { size: 32 }), // Kiểu Address
        signature: res.data.signature as Hex // Định rõ kiểu Hex
      }

      const publicClient = createPublicClient({
        chain: CHAINS[fromNetwork.value!.chainId],
        transport: http(fromNetwork.value!.rpc),
        batch: {
          multicall: {
            batchSize: 1024 * 200
          }
        }
      })
      const gasEstimate = await publicClient.getGasPrice()
      // ✅ Gọi contract bằng wagmi actions
      // const tx = await writeContract(config, {
      //   address: liFiDiamondAddress,
      //   abi: ABI_RELAY_FACET,
      //   functionName: 'startBridgeTokensViaRelay',
      //   args: [bridgeData, relayData],
      //   value: BigInt(form.value.amount) * BigInt(10 ** +form.value.token.tokenDecimals),
      //   gas: BigInt(300000), // Định kiểu BigInt
      //   gasPrice: gasEstimate as bigint // Đảm bảo kiểu bigint
      // })

      const datas = [bridgeData, relayData]

      const calldata = encodeFunctionData({
        abi: ABI_RELAY_FACET,
        functionName: 'startBridgeTokensViaRelay',
        args: datas
      })

      if (!liFiDiamondAddress) throw new Error('Invalid lifi contract address')

      const txHash = await sendTransaction(config, {
        to: liFiDiamondAddress,
        data: calldata,
        value: BigInt(form.value.amount) * BigInt(10 ** +form.value.token.tokenDecimals),
        gas: BigInt(300000), // Định kiểu BigInt
        gasPrice: gasEstimate as bigint // Đảm bảo kiểu bigint
      })

      const { status } = await waitForTransactionReceipt(config, {
        hash: txHash,
        pollingInterval: 2000
      })

      console.log(status)
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  // // Gọi hàm với useContractWrite
  // const { write, isLoading, isSuccess, isError, data } = useContractWrite(writeConfig)
  // console.log(write, isLoading, isSuccess, isError, data)

  // try {
  //   if (isDisabledButton.value) return
  //   // step 1: next step 2
  //   if (stepBridge.value === 'SELECT_TOKEN') {
  //     stepBridge.value = 'CONFIRM_BRIDGE'
  //     return
  //   }
  //   // step 2: approve
  //   if (token0IsToken.value) {
  //     if (isNeedAllowance0.value) {
  //       await approveToken(form.value.token0.address as string, CONTRACT_ADDRESS.SWAP_ROUTER_V3, MAX_NUMBER_APPROVE, (status) => {
  //         if (status === 'SUCCESS') {
  //           swap()
  //         }
  //         isConfirmApprove.value = false
  //       })
  //     } else {
  //       // step 3: swap
  //       console.info('STEP 3 ')
  //       await swap()
  //     }
  //   } else {
  //     // step 3: swap
  //     console.info('STEP 3 ')
  //     await swap()
  //   }
  // } catch (error) {
  //   console.log('🚀 ~ handleBridge ~ error:', error)
  // }
  // }

  // const { approveToken } = useApproveToken()

  // const isNeedAllowance0 = computed(() => {
  //   const allowance = new Decimal(allowance0.value?.toString() || '0').div(10 ** +form.value.token0.decimals)
  //   return allowance0.value === BigInt(0) || allowance.lessThan(0)
  // })

  // const swap = async () => {
  //   try {
  //     isConfirmApprove.value = false
  //     isSwapping.value = true
  //     await useExactInputMulticall(bestTrade.value as SwapOutput)
  //     isSwapping.value = false
  //     stepBridge.value = 'SELECT_TOKEN'
  //     // form.value.amountIn = ''
  //     // form.value.amountOut = ''
  //     form.value.tradingFee = 0
  //   } catch (error) {
  //     console.log('🚀 ~ swap ~ error:', error)
  //     console.info(' (FormSwap.client.vue:319) sign sao sao sao saii  xong r ne')
  //     isConfirmSwap.value = false
  //     isSwapping.value = false
  //     el1?.close()
  //   }
  // }

  // const el1: ReturnType<typeof ElNotification> | null = null

  // const { handleImageError } = useErrorImage()

  const bridgeSuccess = (amount: number, token: string, value: number, explorerLink: string) => {
    const message = `
          <p>${amount} ${token} ⇒ ${value} USDC.</p>
          <p>View on <a style="text-decoration: underline;" href="${explorerLink}" target="_blank" rel="noopener noreferrer">Mon Explorer</a></p>
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

  watch(
    () => toNetwork.value,
    () => {
      form.value.token = {} as IToken
    }
  )
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
</style>
