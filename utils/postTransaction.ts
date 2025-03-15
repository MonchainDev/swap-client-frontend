import { EncryptRequestType, type IBodyTxCollect } from '~/types/encrypt.type'

export default async function postTransaction(body: IBodyTxCollect) {
  const { $buildEncryptedBody } = useNuxtApp()
  const data: IBodyTxCollect = {
    ...body,
    fromToken: body.fromToken?.toLowerCase(),
    toToken: body.toToken?.toLowerCase(),
    poolAddress: body.poolAddress?.toLowerCase(),
    fromAddress: body.fromAddress?.toLowerCase(),
    toAddress: body.toAddress?.toLowerCase(),
    transactionHash: body.transactionHash?.toLowerCase()
  }
  const initSeconds = Math.round((new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000) / 1000)
  const encryptedBody = $buildEncryptedBody(EncryptRequestType.TX_COLLECT, { initSeconds, data })
  await $fetch('/api/transaction/collect', { body: JSON.stringify(encryptedBody), method: 'POST' })
}
