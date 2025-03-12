export default async function postTransaction(body: IBodyTxCollect) {
  const encryptedBody = buildEncryptedBody(EncryptRequestType.TX_COLLECT, body)
  await $fetch('/api/transaction/collect', { body: encryptedBody })
}
