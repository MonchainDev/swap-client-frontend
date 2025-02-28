import { ERC20Token } from '@pancakeswap/swap-sdk-evm'
import { useReadContract } from '@wagmi/vue'

import type { Abi } from 'viem'
import TokenAbi from '~/constant/abi/token.json'
export function useTokenByChainId(tokenAddress: string, chainId: number) {
  /**
   * Khi nao co list all token thi mo lai comment
   */
  //   const unsupportedTokens = useUnsupportedTokens()
  //   const tokens = useAllTokensByChainIds(chainId ? [chainId] : [])
  //   const address = safeGetAddress(tokenAddress)
  //   const token: ERC20Token | undefined = address && chainId ? tokens[chainId][address] : undefined

  const { data: decimals } = useReadContract({
    chainId: chainId as MaybeRef<16789 | 11155111 | undefined>,
    address: tokenAddress as `0x${string}`,
    functionName: 'decimals',
    abi: TokenAbi as Abi
  })

  const { data: name } = useReadContract({
    chainId: chainId as MaybeRef<16789 | 11155111 | undefined>,
    address: tokenAddress as `0x${string}`,
    functionName: 'name',
    abi: TokenAbi as Abi
  })

  const { data: symbol } = useReadContract({
    chainId: chainId as MaybeRef<16789 | 11155111 | undefined>,
    address: tokenAddress as `0x${string}`,
    functionName: 'symbol',
    abi: TokenAbi as Abi
  })

  const token = computed(() => {
    if (decimals.value && name.value && symbol.value) {
      return new ERC20Token(chainId, tokenAddress as `0x${string}`, decimals.value as number, symbol.value as string, name.value as string)
    }
    return undefined
  })

  return { token }
}
