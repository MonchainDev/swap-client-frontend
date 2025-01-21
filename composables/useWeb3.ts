import type { IToken } from '~/types'
import type { IFormCreatePosition } from '~/types/position.type'
import Web3SDK from '~/utils/web3Manager'

export const useWeb3 = () => {
  const { userAddress } = storeToRefs(useAuthStore())

  const init = async () => {
    const address = await Web3SDK.init()
    if (address) {
      userAddress.value = address
    }
    // Web3SDK.addEventListener('accountsChanged', () => {
    //   Web3SDK.disconnectWallet()
    //   window.location.reload()
    // })
  }

  const connectWallet = async () => {
    const address = await Web3SDK.connectWallet()
    userAddress.value = address
  }

  const disconnectWallet = async () => {
    await Web3SDK.disconnectWallet()
    userAddress.value = ''
  }

  const approveToken = async (token: IToken, spender?: string, amount?: string) => {
    return Web3SDK.approveToken(token, spender, amount)
  }

  const transferNativeToken = async (to: string, amount: string) => {
    return Web3SDK.transferNativeToken(to, amount)
  }

  const getBalance = async (token: IToken) => {
    return Web3SDK.getBalance(token)
  }

  const createPool = async (token0: IToken, token1: IToken, form: IFormCreatePosition) => {
    return Web3SDK.createPool(token0, token1, form)
  }

  const getAllowance = async (token: IToken, spender?: string) => {
    return Web3SDK.getAllowance(token, spender)
  }

  return { connectWallet, disconnectWallet, approveToken, transferNativeToken, init, getBalance, createPool, getAllowance }
}
