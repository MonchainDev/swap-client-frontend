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
        <ChooseNetworkBridge type="TO" @select-network="handleSelectNetwork" />
      </div>
    </div>
    <div class="mt-3 w-full sm:mt-4">
      <InputBridge
        v-model:amount="form.amount"
        :is-selected="isTokenSelected"
        :token="form.token"
        :balance="balance?.formatted"
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
              <p class="text-[32px] font-semibold leading-[28px] text-primary sm:text-[22px]">15</p>
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

    <PopupSellToken :list-token="listTokenData" @select="handleSelectToken" />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { createPublicClient, http, type Address, type Hex } from 'viem'
  import { useAccount } from '@wagmi/vue'
  import ethers from 'ethers'
  import { createConfig, writeContract } from '@wagmi/core'
  import type { IToken } from '~/types'
  import { monTestnet } from '~/utils/config/chains'
  import { mainnet, sepolia } from '@wagmi/core/chains'
  import ABI_RELAY_FACET from '@/constant/abi/RelayFacet.json'
  import InputBridge from './InputBridge.vue'
  import ChooseNetworkBridge from './ChooseNetworkBridge.vue'
  import PopupSellToken from '../popup/PopupSellToken.vue'
  import type { TokenConfig } from '~/types/bridge.type'
  import { ElNotification } from 'element-plus'
  import { getBestTradeV2, type SwapOutput } from '~/utils/getBestTradeV2'
  import { TradeType } from '@monchain/swap-sdk-core'
  import { DEFAULT_SLIPPAGE } from '~/constant'
  import { useBridgeTransaction } from '~/composables/useBridgeTransaction'
  import HeaderFormSwap from './HeaderFormSwap.vue'
  import { SwapRouter, type SwapOptions } from '~/composables/swapRouter'
  import swapRouterABI from '~/constant/abi/swapRouter.json'
  import { CONTRACT_ADDRESS, MAX_NUMBER_APPROVE } from '~/constant/contract'
  import type { IFormBridge } from '~/types/bridge.type'
  import { type SmartRouterTrade, type V3Pool } from '@monchain/smart-router'
  import { TradeType } from '@monchain/swap-sdk-core'
  import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import Decimal from 'decimal.js'
  import { encodeFunctionData, hexToBigInt, type Hex } from 'viem'
  import { config } from '~/config/wagmi'
  import type { Route, V3Pool } from '@monchain/smart-router'

  export type StepBridge = 'SELECT_TOKEN' | 'CONFIRM_BRIDGE'

  interface IProps {
    title?: string
  }

  const _props = withDefaults(defineProps<IProps>(), {
    title: 'Bridge'
  })

  const { setOpenPopup } = useBaseStore()
  const { isDesktop } = storeToRefs(useBaseStore())
  const { fromNetwork, toNetwork, balance, form } = storeToRefs(useBridgeStore())
  const isEditSlippage = ref(false)

  const approveAndSend = ref<boolean>(false)
  const { address } = useAccount()

  const stepBridge = ref<StepBridge>('SELECT_TOKEN')

  const bestTrade = ref<SwapOutput | undefined>(undefined)
  const isFetchQuote = ref(false)

  const isTokenSelected = computed(() => form.value.token?.tokenSymbol !== '')
  // const isQuoteExist = computed(() => form.value.amountOut && form.value.amountIn)
  // const formatTitle = computed(() => {
  //   return stepBridge.value === 'SELECT_TOKEN' ? _props.title : 'Confirm bridge'
  // })

  const noRoute = computed(() => !(((bestTrade.value && bestTrade.value?.routes.length) ?? 0) > 0))
  const notEnoughLiquidity = ref(false)

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
    } else if ((!isFetchQuote.value && noRoute.value && isTokenSelected.value) || notEnoughLiquidity.value) {
      return 'You have insufficient balance'
    } else if (isTokenSelected.value) {
      if (stepBridge.value === 'SELECT_TOKEN') {
        return `SEND ${form.value.amount} ${form.value.token.name}: ${fromNetwork.value.title} ⇒ ${toNetwork.value.title}`
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
      !(fromNetwork.value?.network === toNetwork.value?.network) ||
      isFetchQuote.value ||
      noRoute.value ||
      notEnoughLiquidity.value
    )
  })

  const handleSwapOrder = () => {
    if (stepBridge.value === 'CONFIRM_BRIDGE') return
    ;[fromNetwork.value, toNetwork.value] = [toNetwork.value, fromNetwork.value]
    handleSelectNetwork()
  }

  const handleOpenPopupSelectToken = () => {
    if (stepBridge.value === 'CONFIRM_BRIDGE') return
    setOpenPopup('popup-sell-token', true)
  }

  const listTokenData = ref<TokenConfig[]>([])

  function handleSelectNetwork() {
    const query = { network: toNetwork.value?.network, crossChain: 'Y' }
    const { data } = useFetch<TokenConfig[]>('/api/network/token', { query })
    listTokenData.value = data.value || []
  }

  // const poolAddress = ref<string>('')
  const handleInput = async (amount: string) => {
    console.log(amount)
    try {
      notEnoughLiquidity.value = false
      if (!isTokenSelected.value) return
      isFetchQuote.value = true
      if (!amount) {
        isFetchQuote.value = false
        form.value.amount = ''
        isEditSlippage.value = false
        slippage.value = DEFAULT_SLIPPAGE
        return
      }
      
      // đoạn này lấy thông tin token từ chain đích
      // token0 là token có stable = TRUE của mạng gốc 
      // token1 là nếu address là 0x000000, thì sẽ lấy theo wrapToken của network, ngược lại lấy địa chỉ của token luôn 
      form.value.amount = amount
      const inputAmount = Number(form.value.amount) * ((10 ** Number(form.value.token.tokenDecimals)) as number)
      // khởi tạo token0 = new Token() với thông tin token 0
      // khởi tạo token1 = new Token() với thông tin token 1
      // tạm thời lấy fee = 1%
      // outAmount = inAmount * (1 - fee /100)
      const _bestTrade = await getBestTradeV2({
        token0: token.value!,
        token1: token.value!,
        inputAmount: outAmount,
        type: TradeType.EXACT_OUTPUT
      }) as SwapOutput

      /*
      input gọi API sign: http://localhost:8000/api/v1/sign/relay-transfer
      {
        "contractAddress": "địa chỉ contract lifi trên API network, mạng gốc ở network nào thì lấy theo contract của network đó",
        "chainId": chain gốc,
        "destinationChainId": chain đích,
        "receiverAddress": "địa chỉ ví nhận",
        "sendingAssetId": "địa chỉ token chuyển đi, luôn lấy theo API",
        "receiverAssetId": "luôn lấy địa address api",
        "amountIn": Số tiền nhập vào dạng wei,
        "routes": [
            {
                "tokenInAddress": "địa chỉ token USDT",
                "tokenOutAddress": "Địa chỉ token nhận ở mạng đích, nếu address là 0x000000, thì sẽ lấy theo wrapToken của network",
                "fee": "100",
                "amountOut": "10000000a",
                "amountInMaximum": "10000000",
                "sqrtPriceLimitX96": "10000000"

            }
        ]
      }
      */

      const trade = _bestTrade as SmartRouterTrade<TradeType>
      const routes = trade.routes as Route[]
      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];

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

        const routeIn = {
           tokenInAddress: route.inputAmount.currency.wrapped.address,
           tokenOutAddress: route.outputAmount.currency.wrapped.address,
           fee: (route.pools[0] as V3Pool).fee,
           amountOut: route.outputAmount.numerator,
           amountInMaximum: route.inputAmount.numerator,
           sqrtPriceLimitX96: sqrtPriceLimitX96
        }
      }

      console.log('🚀 ~ handleInput ~ _bestTrade:', _bestTrade)
      isFetchQuote.value = false
    } catch (_error) {
      console.error('🚀 ~ handleInput ~ _error:', _error)
      isFetchQuote.value = false
      notEnoughLiquidity.value = true
    }
  }

  const handleSelectToken = (token: TokenConfig) => {
    form.value.token = token
  }

  // const useExactInputMulticall = async (swapOut: SwapOutput) => {
  //   const trade = swapOut as SmartRouterTrade<TradeType>
  //   const datas: Hex[] = []

  //   for (const route of trade.routes) {
  //     const tokenIn = route.path[0].wrapped.address
  //     const tokenOut = route.path[1].wrapped.address
  //     const liquidity = (route.pools[0] as V3Pool).liquidity.toString()
  //     const sqrtRatioX96 = (route.pools[0] as V3Pool).sqrtRatioX96
  //     const currentPrice = new Decimal(sqrtRatioX96.toString()).div(new Decimal(2).pow(96)).pow(2)

  //     const zeroToOne = route.path[0].wrapped.sortsBefore(route.path[1].wrapped)
  //     let nextPrice: Decimal = new Decimal(0)
  //     if (zeroToOne) {
  //       // √(Pnew) = L / ( (L/√(Pcurrent)) + Δx )
  //       nextPrice = new Decimal(liquidity).div(new Decimal(liquidity).div(currentPrice.sqrt()).add(trade.inputAmount.numerator.toString())).pow(2)
  //     } else {
  //       // √(Pnew) = (Δy / L) + √(Pcurrent)
  //       nextPrice = new Decimal(trade.inputAmount.numerator.toString()).div(new Decimal(liquidity)).add(currentPrice.sqrt()).pow(2)
  //     }
  //     const sqrtPriceLimitX96 = nextPrice
  //       .sqrt()
  //       .mul(2 ** 96)
  //       .toNumber()

  //     const fee = (route.pools[0] as V3Pool).fee
  //     const recipient = address.value
  //     const deadline = Math.floor(Date.now() / 1000) + 5 * 60 // 5 minutes
  //     const amount = bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? route.inputAmount.numerator : route.outputAmount.numerator
  //     const amountLimit =
  //       bestTrade.value?.tradeType === TradeType.EXACT_INPUT
  //         ? Math.floor((Number(route.outputAmount.numerator) * (100 - Number(slippage.value))) / 100)
  //         : Math.floor((Number(route.inputAmount.numerator) * (100 + Number(slippage.value))) / 100)
  //     const params = [tokenIn, tokenOut, fee, recipient, deadline, amount, amountLimit, sqrtPriceLimitX96]
  //     const encodedData = encodeFunctionData({
  //       abi: swapRouterABI,
  //       functionName: bestTrade.value?.tradeType === TradeType.EXACT_INPUT ? 'exactInputSingle' : 'exactOutputSingle',
  //       args: [params]
  //     })

  //     datas.push(encodedData)
  //   }

  //   const calldata = encodeFunctionData({
  //     abi: swapRouterABI,
  //     functionName: 'multicall',
  //     args: [datas]
  //   })

  //   const txHash = await sendTransaction(config, {
  //     to: CONTRACT_ADDRESS.SWAP_ROUTER_V3 as `0x${string}`,
  //     data: calldata,
  //     value: hexToBigInt('0x0')
  //   })

  //   const { status } = await waitForTransactionReceipt(config, {
  //     hash: txHash,

  //     pollingInterval: 2000
  //   })

  //   if (status === 'success') {
  //     const { showToastMsg } = useShowToastMsg()
  //     showToastMsg('Swap successful', 'success', txHash)
  //     console.info('Transaction successful', 'success', txHash)
  //   } else {
  //     ElMessage.error('Transaction failed')
  //     console.info('Transaction failed', 'error', txHash)
  //   }
  // }

  const publicClient = createPublicClient({
    chain: monTestnet,
    transport: http('https://rpc-testnet.monchain.info'),
    batch: {
      multicall: {
        batchSize: 1024 * 200
      }
    }
  })
  const gasEstimate = await publicClient.getGasPrice()

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

  const response: ResponseData = {
    requestId: '0x30314a504a383446423053593453414446444e58534644394242000000000000',
    signature: '0x43c9ddbb1db90a0d218bd5c2339ca25ff8539b92d674ef47b2344811b70d977924ee8a0defd0ff9cefaf084a6a0420715b2f0e393c16d7106ae98dd5a9889ae71c',
    iterator: 'SERVICE'
  }
  // Transaction parameters
  const receiverAddress = '0x31fB83Dc60D27C9C4a58a361bc9c48e0Bcfe902B'
  const destinationChainId = 137
  const receiverAssetId = address.value as `0x${string}`
  interface ResponseData {
    requestId: string
    iterator: string
    signature: string
  }

  const handleBridge = async () => {
    // approveAndSend.value = !approveAndSend.value
    bridgeSuccess(15, 'ATOM', 123.566, 'https://explorer.monchain.info')

    const config = createConfig({
      chains: [mainnet, sepolia],
      transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http()
      }
    })

    try {
      if (!isConnected.value) throw new Error('Wallet not connected')
      const liFiDiamondAddress: Address = '0x4797F967C3D77A1949Fb7F429f09072dFdB6de9d'

      const bridgeData = {
        transactionId: response.requestId as string, // Kiểu dữ liệu string
        bridge: 'relay' as const, // Hằng số kiểu string
        integrator: response.iterator as string, // Định rõ kiểu dữ liệu
        referrer: ethers.constants.AddressZero as Address, // Định rõ kiểu Address
        sendingAssetId: (form.value.token.address || ethers.constants.AddressZero) as Address,
        receiver: receiverAddress as Address,
        minAmount: ethers.utils.parseUnits(form.value.amount.toString(), +form.value.token.decimals),
        destinationChainId: destinationChainId as number, // Chắc chắn kiểu số
        hasSourceSwaps: false,
        hasDestinationCall: false
      }

      const relayData = {
        requestId: response.requestId as string,
        nonEVMReceiver: ethers.constants.HashZero as Hex, // Định rõ kiểu Hex
        receivingAssetId: ethers.utils.hexZeroPad(receiverAssetId, 32) as Address, // Kiểu Address
        signature: response.signature as Hex // Định rõ kiểu Hex
      }

      // ✅ Gọi contract bằng wagmi actions
      const tx = await writeContract(config, {
        address: liFiDiamondAddress,
        abi: ABI_RELAY_FACET,
        functionName: 'startBridgeTokensViaRelay',
        args: [bridgeData, relayData],
        value: BigInt(form.value.amount) * BigInt(10 ** +form.value.token.decimals),
        gas: BigInt(300000), // Định kiểu BigInt
        gasPrice: gasEstimate as bigint // Đảm bảo kiểu bigint
      })

      console.log('Transaction sent:', tx)
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }
  // const bridgeData = {
  //   transactionId: response.data.requestId, // mã request id (api trả về)
  //   bridge: 'relay', // mã loại bridge,
  //   integrator: response.data.iterator, // tên itergrator (fix trong ENV)
  //   referrer: ethers.constants.AddressZero, // mặc định 0x0
  //   sendingAssetId: token, // địa chỉ token (địa chỉ contract), nếu là native thì để 0x000 (AddressZero)
  //   receiver: receiverAddress, // = 0x31fB83Dc60D27C9C4a58a361bc9c48e0Bcfe902B đỉa chỉ ví nhận tiền
  //   minAmount: ethers.utils.parseUnits('1', 6), // số tiền tối thiểu muốn chuyển sang mạng kahcs (=giá trị amount, decimal của token)
  //   destinationChainId: destinationChainId, // chain id của mạng đích
  //   hasSourceSwaps: false, // luônlà false
  //   hasDestinationCall: false // luôn là false
  // }

  // const relayData = {
  //   requestId: response.data.requestId, // phải giống request id
  //   nonEVMReceiver: ethers.constants.HashZero, // luôn là 0x000
  //   receivingAssetId: ethers.utils.hexZeroPad(receiverAssetId, 32), // địa chỉ token ở mạng đích, nếu là native để 0x000
  //   signature: response.data.signature //mã signature từ backend trả ra
  // }

  // // "LiFiDiamond": 0x4797F967C3D77A1949Fb7F429f09072dFdB6de9d,
  // // Địa chỉ LiFiDiamond từ config
  // const liFiDiamondAddress = '0x4797F967C3D77A1949Fb7F429f09072dFdB6de9d' // = 0x4797F967C3D77A1949Fb7F429f09072dFdB6de9d  // Thay bằng địa chỉ thực tế

  // // Cấu hình transaction với usePrepareContractWrite
  // const { config: writeConfig } = usePrepareWriteContract({
  //   address: liFiDiamondAddress, // Địa chỉ LiFiDiamond
  //   abi: ABI_RELAY_FACET, // ABI của RelayFacet (.json)
  //   functionName: 'startBridgeTokensViaRelay', // Tên hàm
  //   args: [bridgeData, relayData], // Các tham số của hàm
  //   value: BigInt(Number(form.value.amount) * 10 ** Number(form.value.token.decimals)), // Nếu dùng native token thì thay bằng minAmount (amount * 10^decimals của token)
  //   gas: 300000, // gasLimit
  //   gasPrice: gasEstimate // gasPrice
  // })

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

  // // Define TypeScript types for better safety
  // interface ResponseData {
  //   requestId: string
  //   iterator: string
  //   signature: string
  // }

  // interface BridgeTransactionParams {
  //   response: ResponseData
  //   token: string
  //   receiverAddress: string
  //   destinationChainId: number
  //   receiverAssetId: `0x${string}`
  //   gasEstimate: bigint
  //   form: IFormBridge
  // }

  // function useBridgeTransaction({ response, token, receiverAddress, destinationChainId, receiverAssetId, gasEstimate, form }: BridgeTransactionParams) {
  //   const liFiDiamondAddress: `0x${string}` = '0x4797F967C3D77A1949Fb7F429f09072dFdB6de9d'

  //   // Prepare Bridge Data
  //   const bridgeData = computed(() => ({
  //     transactionId: response.requestId,
  //     bridge: 'relay',
  //     integrator: response.iterator,
  //     referrer: zeroAddress,
  //     sendingAssetId: token,
  //     receiver: receiverAddress,
  //     minAmount: parseUnits(form.amount, +form.token.decimals),
  //     destinationChainId,
  //     hasSourceSwaps: false,
  //     hasDestinationCall: false
  //   }))

  //   // Prepare Relay Data
  //   const relayData = computed(() => ({
  //     requestId: response.requestId,
  //     nonEVMReceiver: zeroHash, // Use viem's zeroHash instead of ethers.constants.HashZero
  //     receivingAssetId: hexZeroPad(receiverAssetId, 32),
  //     signature: response.signature
  //   }))

  //   // Wagmi contract write hook
  //   const { data, isPending, isError, error, writeContract } = useWriteContract()

  //   // Function to execute transaction
  //   const writeContractTransaction = async () => {
  //     try {
  //       const tx = await writeContract({
  //         address: liFiDiamondAddress,
  //         abi: ABI_RELAY_FACET,
  //         functionName: 'startBridgeTokensViaRelay',
  //         args: [bridgeData.value, relayData.value],
  //         value: BigInt(Number(form.amount) * 10 ** Number(form.token.decimals)),
  //         gas: 300000n,
  //         gasPrice: gasEstimate
  //       })

  //       console.log('Transaction sent:', tx)
  //     } catch (error) {
  //       console.error('Transaction failed:', error)
  //     }
  //   }

  //   return {
  //     writeContractTransaction,
  //     data,
  //     isPending,
  //     isError,
  //     error
  //   }
  // }

  watch(
    () => toNetwork.value,
    () => {
      form.value.token = {} as TokenConfig
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
