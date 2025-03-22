import URL_SCAN from '~/config/scan'
import type { ChainId } from '~/types'

export default function getUrlScan(chainId: ChainId | number | undefined, type: 'tx' | 'address', address: string) {
  if (chainId === undefined) {
    throw new Error('chainId is undefined')
  }
  return `${URL_SCAN[chainId as ChainId][type]}/${address}`
}
