import type { SDKProvider } from '@metamask/sdk'
import { MetaMaskSDK } from '@metamask/sdk'
import Web3, { type AbiFunctionFragment } from 'web3'

import CONTRACT_APPROVE from '@/constant/contract/contract-approve.json'
import CONTRACT_TOKEN from '@/constant/contract/contract-token.json'
import { DECIMALS_NATIVE } from '~/constant'
import type { IToken } from '~/types'

class Web3Manager {
  userAddress: string = ''
  MMSDK: MetaMaskSDK
  currentProvider: SDKProvider | undefined | null = null
  web3: Web3 | null = null

  constructor() {
    this.MMSDK = new MetaMaskSDK({
      dappMetadata: {
        name: 'Dex-Swap',
        url: ''
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

  async approveToken(token: IToken, spender: string, amount: string) {
    const allowance = await this.checkAllowance(token, spender)
    if (+allowance >= +amount) return
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
    const balance = await this.web3!.eth.getBalance(this.userAddress)
    const formattedBalance = this.web3!.utils.fromWei(balance, DECIMALS_NATIVE)
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
    return this.web3!.eth.abi.encodeFunctionCall(abi, params)
  }

  async checkAllowance(token: IToken, spender: string) {
    const contract = new this.web3!.eth.Contract(CONTRACT_TOKEN, token.address)
    const allowance = await contract.methods.allowance(this.userAddress, spender).call()
    return allowance
  }

  async checkStatusTransaction(txHash: string) {
    return await this.web3!.eth.getTransactionReceipt(txHash)
  }
}

const Web3SDK = new Web3Manager()
export default Web3SDK
