import type { SDKProvider } from '@metamask/sdk'
import { MetaMaskSDK } from '@metamask/sdk'
import Web3, { type AbiFunctionFragment } from 'web3'

import CONTRACT_APPROVE from '@/constant/contract/contract-approve.json'
import CONTRACT_TOKEN from '@/constant/contract/contract-token.json'
import CONTRACT_NFT_POSITION from '@/constant/contract/contract-nonfungible-position-manager.json'
import { DECIMALS_NATIVE } from '~/constant'
import type { IToken } from '~/types'
import Decimal from 'decimal.js'
import createAndInitializePoolIfNecessaryABI from '@/constant/abi/createAndInitializePoolIfNecessary.json'
import mintABI from '@/constant/abi/mint.json'
import refundETHABI from '@/constant/abi/refundETH.json'
import type { IFormCreatePosition } from '~/types/position.type'

class Web3Manager {
  userAddress: string = ''
  MMSDK: MetaMaskSDK
  currentProvider: SDKProvider | undefined | null = null
  web3: Web3 | null = null

  constructor() {
    console.log(import.meta.env.VITE_BASE_DOMAIN)

    this.MMSDK = new MetaMaskSDK({
      dappMetadata: {
        name: 'Dex-Swap',
        url: import.meta.env.VITE_BASE_DOMAIN
      }
    })
  }

  async init() {
    await this.MMSDK.init()
    this.currentProvider = this.MMSDK.getProvider()
    this.web3 = new Web3(this.currentProvider)

    const isConnected = JSON.parse(localStorage.getItem('isConnected') || 'false')
    if (isConnected) {
      return await this.connectWallet()
    }
  }

  async connectWallet() {
    try {
      await this.MMSDK.connect()
      localStorage.setItem('isConnected', 'true')
      this.userAddress = this.currentProvider?.selectedAddress || ''
      return this.currentProvider?.selectedAddress
    } catch (error) {
      console.log('🚀 ~ Web3Manager ~ connectWallet ~ error:', error)
    }
  }

  addEventListener(event: string, cb: (args: unknown) => void) {
    this.currentProvider?.on(event, cb)
  }

  removeEventListener(event: string, cb: (args: unknown) => void) {
    this.currentProvider?.off(event, cb)
  }

  async disconnectWallet() {
    this.currentProvider?.off('accountsChanged', () => {})
    await this.MMSDK.disconnect()
    this.userAddress = ''
    localStorage.removeItem('isConnected')
  }

  async approveToken(
    token: IToken,
    spender = '0x4298706288f08E37B41096e888B00100Bd99e060',
    amount = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
  ) {
    const allowance = await this.getAllowance(token, spender)
    const minus = new Decimal(amount).minus(allowance)
    if (minus.lessThanOrEqualTo(0)) return

    const contract = new this.web3!.eth.Contract(CONTRACT_APPROVE, token.address)
    const tx = await contract.methods.approve(spender, amount).send({
      from: this.userAddress
    })
    return tx.transactionHash
  }

  async transferNativeToken(to: string, amount: string) {
    const tx = await this.web3!.eth.sendTransaction({
      from: this.userAddress,
      to,
      value: this.web3!.utils.toWei(amount, DECIMALS_NATIVE)
    })
    return tx.transactionHash
  }

  async getNativeTokenBalance() {
    if (!this.userAddress) return '0'
    console.log(this.userAddress)

    const balance = await this.web3!.eth.getBalance(this.userAddress)
    const formattedBalance = this.web3!.utils.fromWei(balance, DECIMALS_NATIVE)
    console.log('🚀 ~ Web3Manager ~ getNativeTokenBalance ~ formattedBalance:', formattedBalance)
    return formattedBalance
  }

  async getBalanceOfToken(token: IToken) {
    const contract = new this.web3!.eth.Contract(CONTRACT_TOKEN, token.address)
    const balance = (await contract.methods.balanceOf(this.userAddress).call()) as string
    return this.web3!.utils.fromWei(balance, +token.decimals)
  }

  async getBalance(token: IToken) {
    const isNative = token.address === ''
    if (isNative) {
      return this.getNativeTokenBalance()
    } else {
      return this.getBalanceOfToken(token)
    }
  }

  encodeFunctionCall(abi: AbiFunctionFragment, params: unknown[]) {
    console.log('🚀 ~ Web3Manager ~ encodeFunctionCall ~ params:', params)
    return this.web3!.eth.abi.encodeFunctionCall(abi, params)
  }

  async getAllowance(token: IToken, spender = '0x4298706288f08E37B41096e888B00100Bd99e060') {
    const contract = new this.web3!.eth.Contract(CONTRACT_TOKEN, token.address)
    const allowance = (await contract.methods.allowance(this.userAddress, spender).call()) as bigint
    return allowance.toString()
  }

  async checkStatusTransaction(txHash: string) {
    return await this.web3!.eth.getTransactionReceipt(txHash)
  }

  async createPool(token0: IToken, token1: IToken, form: IFormCreatePosition) {
    try {
      const sqrtPriceX96 = calcSqrtPriceX96(+form.amount, +token0.decimals, +token1.decimals)
      const inputCreateAndInitializePoolIfNecessary = [token0.address, token1.address, 3000, sqrtPriceX96.toString()]
      const encodeCreateAndInitializePoolIfNecessary = this.encodeFunctionCall(
        createAndInitializePoolIfNecessaryABI as unknown as AbiFunctionFragment,
        inputCreateAndInitializePoolIfNecessary
      )

      const inputMint = {
        token0: token0.address, // BASE
        token1: token1.address, // QUOTE
        fee: form.feeTier * 1000, // bps to ppm ex: 0.3% => 300
        tickLower: -887220, // fixed
        tickUpper: 887220, // fixed
        amount0Desired: '1000000000000000000', // fixed 1 BASE
        amount1Desired: '10000000', // fixed 10 USDT
        amount0Min: '0',
        amount1Min: '0',
        recipient: this.userAddress,
        deadline: Math.floor(Date.now() / 1000) + 3600
      }

      const encodeMint = this.encodeFunctionCall(mintABI as unknown as AbiFunctionFragment, [{ ...inputMint }])

      const encodeRefundETH = this.encodeFunctionCall(refundETHABI as unknown as AbiFunctionFragment, [])

      const contractNFTPostion = new this.web3!.eth.Contract(CONTRACT_NFT_POSITION, '0x8762697E792C841FA44F2e73f56EA1cC32eC80D5')
      const tx = await contractNFTPostion.methods
        .multicall([encodeCreateAndInitializePoolIfNecessary, encodeMint, encodeRefundETH])
        .send({ from: this.userAddress })
      return tx.transactionHash
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const Web3SDK = new Web3Manager()
export default Web3SDK
