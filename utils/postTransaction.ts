export default async function postTransaction(body: IBodyTxCollect) {
  const encryptedBody = buildEncryptedBody(EncryptRequestType.TX_COLLECT, body)
  console.log('🚀 ~ postTransaction ~ encryptedBody:', encryptedBody)
  await $fetch('/api/transaction/collect', { body: JSON.stringify(encryptedBody), method: 'POST' })
}
