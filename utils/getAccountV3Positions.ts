import { nonfungiblePositionManagerABI } from '@wicchain/v3-sdk'
import Decimal from 'decimal.js'
import { getContract as viemGetContract, type Abi, type Address, type GetContractReturnType, type PublicClient, type WalletClient } from 'viem'
import masterChefV3ABI from '~/constant/abi/masterChefV3.json'
import { ChainId, type PositionDetail } from '~/types'
import { getAccountV3TokenIds } from './getAccountV3TokenIds'

export const getContract = <TAbi extends Abi | readonly unknown[], TWalletClient extends WalletClient>({
  abi,
  address,
  chainId = ChainId.MON_TESTNET,
  publicClient,
  signer
}: {
  abi: TAbi | readonly unknown[]
  address: Address
  chainId?: ChainId
  signer?: TWalletClient
  publicClient?: PublicClient
}) => {
  const c = viemGetContract({
    abi,
    address,
    client: {
      public: publicClient ?? viemClients[chainId],
      wallet: signer
    }
  }) as unknown as GetContractReturnType<TAbi, PublicClient, Address>

  return {
    ...c,
    account: signer?.account,
    chain: signer?.chain
  }
}

export const getMasterChefV3Contract = (signer?: WalletClient, chainId?: number) => {
  const mcv3Address = getMasterChefV3Address(chainId ?? ChainId.MON_TESTNET)
  return mcv3Address
    ? getContract({
        abi: masterChefV3ABI,
        address: mcv3Address,
        chainId,
        signer
      })
    : null
}

export const readPositions = async (chainId: number, tokenIds: bigint[]): Promise<PositionDetail[]> => {
  const nftPositionManagerAddress = getNftPositionManagerAddress(chainId)
  const client = publicClient({ chainId })
  const masterChefV3 = getMasterChefV3Contract(undefined, chainId)

  if (!client || !nftPositionManagerAddress || !tokenIds.length || !masterChefV3) {
    return []
  }
  const positionPromises = tokenIds.map((tokenId) =>
    client.readContract({
      abi: nonfungiblePositionManagerABI,
      address: nftPositionManagerAddress as `0x${string}`,
      functionName: 'positions',
      args: [tokenId] as const
    })
  )

  const farmingPromises = tokenIds.map((tokenId) =>
    client.readContract({
      abi: masterChefV3.abi as Abi,
      address: masterChefV3.address,
      functionName: 'userPositionInfos',
      args: [tokenId] as const
    })
  )

  const [positions, farmingPositions] = await Promise.all([Promise.all(positionPromises), Promise.all(farmingPromises)])

  console.log('Positions:', positions)
  console.log('Farming Positions:', farmingPositions)

  return positions.map((position, index) => {
    const [
      nonce,
      operator,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1
    ] = position
    const [farmingLiquidity, , , , , , , , boostMultiplier] = farmingPositions[index] as [
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      number
    ]
    return {
      tokenId: tokenIds[index],
      nonce,
      operator,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1,
      chainId,
      protocol: 'v3',
      farmingMultiplier: new Decimal(Number(boostMultiplier)).div(1e12).toNumber() ?? 0,
      farmingLiquidity,
      isStaked: farmingLiquidity > 0n
    } satisfies PositionDetail
  })
}

export const getAccountV3Positions = async (chainId: number, account: Address): Promise<PositionDetail[]> => {
  const { farmingTokenIds, nonFarmTokenIds } = await getAccountV3TokenIds(chainId, account)

  const positions = await readPositions(chainId, farmingTokenIds.concat(nonFarmTokenIds))

  const farmingTokenIdsLength = farmingTokenIds.length
  positions.forEach((_, index) => {
    positions[index].isStaked = index < farmingTokenIdsLength
  })

  return positions
}
