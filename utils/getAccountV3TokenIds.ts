import type { Address } from 'viem'
import masterChefV3ABI from '~/constant/abi/masterChefV3.json'

export const getAccountV3TokenIdsFromContract = async (chainId: number, account: Address, contractAddress: Address | undefined | null) => {
  const client = publicClient({ chainId })

  if (!contractAddress || !account || !client) {
    return []
  }

  const balance = (await client.readContract({
    abi: masterChefV3ABI,
    address: contractAddress,
    functionName: 'balanceOf',
    args: [account] as const
  })) as bigint

  const tokenIdPromises = Array.from(
    { length: Number(balance) },
    (_, i) =>
      client.readContract({
        abi: masterChefV3ABI,
        address: contractAddress,
        functionName: 'tokenOfOwnerByIndex',
        args: [account, i] as const
      }) as Promise<bigint>
  )

  const tokenIds = await Promise.all(tokenIdPromises)

  return tokenIds
}

export const getAccountV3TokenIds = async (chainId: number, account: Address) => {
  const masterChefV3Address = getMasterChefV3Address(chainId)
  const nftPositionManagerAddress = getNftPositionManagerAddress(chainId)

  const [farmingTokenIds, nonFarmTokenIds] = (await Promise.all([
    getAccountV3TokenIdsFromContract(chainId, account, masterChefV3Address),
    getAccountV3TokenIdsFromContract(chainId, account, nftPositionManagerAddress)
  ])) as [bigint[], bigint[]]

  return {
    farmingTokenIds,
    nonFarmTokenIds
  }
}
