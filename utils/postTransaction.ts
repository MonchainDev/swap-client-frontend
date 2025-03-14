export default async function postTransaction(body: IBodyTxCollect) {
  const initSeconds = Math.round((new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000) / 1000)
  const encryptedBody = buildEncryptedBody(EncryptRequestType.TX_COLLECT, { initSeconds, data: body })
  await $fetch('/api/transaction/collect', { body: JSON.stringify(encryptedBody), method: 'POST' })
}
