import {readContract} from '@wagmi/core'
import {config} from '~/config/wagmi'
import TOKEN from '@/constant/abi/Token.json'

export const useGetTokenInfo = async (tokenAddress: string) => {
  const decimals = await readContract(config, {
    abi: TOKEN,
    address: tokenAddress as `0x${string}`,
    functionName: 'decimals'
  }) as number
  const symbol = await readContract(config, {
    abi: TOKEN,
    address: tokenAddress as `0x${string}`,
    functionName: 'symbol'
  }) as string
  return {
    decimals: Number(decimals),
    symbol,
    chainId: 16789,
  } as {
    decimals: number;
    symbol: string;
    chainId: number;
  }
}

export const useBalanceOf = async (tokenAddress: string, ownerAddress: string) => {
  return await readContract(config, {
    abi: TOKEN,
    address: tokenAddress as `0x${string}`,
    functionName: 'balanceOf',
    args: [ownerAddress as `0x${string}`]
  }) as bigint
}

