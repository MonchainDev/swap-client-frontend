import { ERC20Token } from '@monchain/swap-sdk-evm'

import type { Abi } from 'viem'
import { readContract } from '@wagmi/core'
import { config } from '~/config/wagmi'
import TokenAbi from '~/constant/abi/token.json'
export async function getTokenByChainId(tokenAddress: string, chainId: number) {
  console.log('🚀 ~ useTokenByChainId ~ chainId:', chainId)
  console.log('🚀 ~ useTokenByChainId ~ tokenAddress:', tokenAddress)

  /**
   * Khi nao co list all token thi mo lai comment
   */
  //   const unsupportedTokens = useUnsupportedTokens()
  //   const tokens = useAllTokensByChainIds(chainId ? [chainId] : [])
  //   const address = safeGetAddress(tokenAddress)
  //   const token: ERC20Token | undefined = address && chainId ? tokens[chainId][address] : undefined

  const [decimal, name, symbol] = await Promise.all([
    readContract(config, {
      chainId: chainId,
      address: tokenAddress as `0x${string}`,
      functionName: 'decimals',
      abi: TokenAbi as Abi
    }),
    readContract(config, {
      chainId: chainId,
      address: tokenAddress as `0x${string}`,
      functionName: 'name',
      abi: TokenAbi as Abi
    }),
    readContract(config, {
      chainId: chainId,
      address: tokenAddress as `0x${string}`,
      functionName: 'symbol',
      abi: TokenAbi as Abi
    })
  ])

  return new ERC20Token(chainId, tokenAddress as `0x${string}`, decimal as number, symbol as string, name as string)
}
