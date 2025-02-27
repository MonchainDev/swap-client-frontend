import { ChainId } from '@monswap/chains'
import { FeeAmount } from '@monswap/v3-sdk'
import { GaugeConfig, GaugeType } from '../../types'

export const CONFIG_TESTNET: GaugeConfig[] = [
  {
    gid: 0,
    address: '0x523405d3072368BEe373F04EE738f2Aa3e3718c6',
    chainId: ChainId.BSC,
    type: GaugeType.V2,
    token0Address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    token1Address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    pairName: 'CAKE-WBNB',
    feeTier: FeeAmount.MEDIUM,
  },
  {
    gid: 1,
    address: '0x05739503273DbFd72240C6d854675E1c67a75ce4',
    chainId: ChainId.ARBITRUM_ONE,
    type: GaugeType.V2,
    token0Address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    token1Address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    pairName: 'WETH-USDC',
    feeTier: FeeAmount.MEDIUM,
  },
  {
    gid: 2,
    address: '0x36696169C63e42cd08ce11f5deeBbCeBae652050',
    chainId: ChainId.BSC,
    type: GaugeType.V3,
    token0Address: '0x55d398326f99059fF775485246999027B3197955',
    token1Address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    pairName: 'USDT-WBNB',
    feeTier: FeeAmount.LOW,
  },
  {
    gid: 3,
    address: '0x803036AC78752EF599EC75c500ac8B0Ac0bE67dF',
    chainId: ChainId.BSC,
    type: GaugeType.V3,
    token0Address: '0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3',
    token1Address: '0x55d398326f99059fF775485246999027B3197955',
    pairName: 'alxUSDC-USDT',
    feeTier: FeeAmount.LOWEST,
  },
  {
    gid: 4,
    address: '0x0BaCc7a9717e70EA0DA5Ac075889Bd87d4C81197',
    chainId: ChainId.ARBITRUM_ONE,
    type: GaugeType.V3,
    token0Address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    token1Address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    pairName: 'WETH-USDC',
    feeTier: FeeAmount.LOW,
  },
  {
    gid: 5,
    address: '0x0d7c4b40018969f81750d0a164c3839a77353EFB',
    chainId: ChainId.ARBITRUM_ONE,
    type: GaugeType.V3,
    token0Address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    token1Address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    pairName: 'WETH-ARB',
    feeTier: FeeAmount.LOW,
  },
  {
    gid: 6,
    address: '0x7524Fe020EDcD072EE98126b49Fa65Eb85F8C44C',
    chainId: ChainId.ETHEREUM,
    type: GaugeType.V3,
    token0Address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    token1Address: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
    pairName: 'USDC-STG',
    feeTier: FeeAmount.MEDIUM,
  },
  {
    gid: 7,
    address: '0x799Ea58D15429fa7C42cc211e2181FD4EF54ec37',
    chainId: ChainId.BSC,
    type: GaugeType.ALM,
    pairName: 'USDT-WBNB (BRIL#2)',
    token0Address: '0x55d398326f99059fF775485246999027B3197955',
    token1Address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
  {
    gid: 8,
    address: '0xBfaa05CA3078912344491926Ff81F6a75AEFea8b',
    chainId: ChainId.ETHEREUM,
    type: GaugeType.ALM,
    pairName: 'USDC-USDT (RANGE#2)',
    token0Address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    token1Address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  {
    gid: 9,
    address: '0x589e8bC919fF18fbF62c7C3d8E3fD86ecD7549C3',
    chainId: ChainId.ETHEREUM,
    type: GaugeType.ALM,
    pairName: 'rETH-WETH (RANGE#1)',
    token0Address: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    token1Address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  {
    gid: 10,
    address: '0xa9B98C0cc70a7625aCB12B7dec5D278F317d4Cb0',
    chainId: ChainId.ARBITRUM_ONE,
    type: GaugeType.ALM,
    pairName: 'WETH-ARB (DEFIEDGE#1)',
    token0Address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    token1Address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
  },
  {
    gid: 11,
    address: '0x881Ed694980A03EE653508aeb9EF3ffD9f56aC99',
    chainId: ChainId.BSC,
    type: GaugeType.VeCakePool,
    pairName: 'Testnet RevenueSharingPool',
  },
]
