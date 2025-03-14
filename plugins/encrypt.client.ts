import JSEncrypt from 'jsencrypt'
import CryptoJs from 'crypto-js'
import type { EncryptedBody, EncryptRequestType, IBodyTxCollect } from '~/types/encrypt.type'

export default defineNuxtPlugin(() => {
  function encrypt(data: { initSeconds: number; data: IBodyTxCollect }): { encryptedData: string; encryptedAesKey: string } | null {
    if (!import.meta.client) {
      console.error('This function can only be used in the browser')
      return null
    }
    const PUBLIC_KEY = import.meta.env.VITE_NUXT_PUBLIC_KEY
    if (!PUBLIC_KEY) {
      console.error('NUXT_PUBLIC_KEY is not defined')
      return null
    }
    const encryptor = new JSEncrypt()
    encryptor.setPublicKey(PUBLIC_KEY)

    const aesKey = CryptoJs.lib.WordArray.random(16).toString()
    const _data = JSON.stringify(data)

    // Convert the key from hex to a CryptoJS format
    const aesKeyBytes = CryptoJs.enc.Utf8.parse(aesKey)
    const encryptedAesKey = encryptor.encrypt(aesKey)
    if (!encryptedAesKey) {
      console.error('Failed to encrypt the AES key, please check the public key: ', PUBLIC_KEY)
      return null
    }

    // Encrypt the data
    const ciphertext = CryptoJs.AES.encrypt(CryptoJs.enc.Utf8.parse(_data), aesKeyBytes, {
      mode: CryptoJs.mode.ECB,
      padding: CryptoJs.pad.Pkcs7 // Ensure you use PKCS7 padding
    })

    // Convert the ciphertext to a Base64 string
    const contentBase64Str = ciphertext.toString()

    return {
      encryptedData: contentBase64Str,
      encryptedAesKey: encryptedAesKey.toString()
    }
  }

  /**     
 * 
 * @param requestType 
 * @param data 
 * @returns 
 * 
 * @example
 * ```ts
    const body = [{
        "transactionHash": "transactionHash_3f4e3e330295",
        "fromAddress": "fromAddress_4432c1cea3d9",
        "toAddress": "toAddress_0e15a8e822c3",
        "fromToken": "fromToken_16cb18d89cf9",
        "toToken": "toToken_f3bb433fb956",
        "poolAddress": "poolAddress_8eaf8c8f8d86",
        "network": "network_444449c7ddfe",
        "tokenId": 0,
        "amount": 0.00,
        "feeAmount": 0.00,
        "rewardAmount": 0.00,
        "transactionType": "transactionType_716680828140",
        "createdAt": "2025-03-11 17:52:55"
    }]
    const encryptedBody = buildEncryptedBody(EncryptRequestType.TX_COLLECT, body)
    const result = await $fetch('transaction/collect', 'POST', { data: encryptedBody })
* ```
*/
  function buildEncryptedBody(requestType: EncryptRequestType, body: { initSeconds: number; data: IBodyTxCollect }): EncryptedBody {
    const encrypted = encrypt(body)
    if (!encrypted) {
      throw new Error('Failed to encrypt data')
    }
    return {
      requestType,
      content: encrypted.encryptedData,
      contentKey: encrypted.encryptedAesKey
    }
  }
  return {
    provide: {
      buildEncryptedBody
    }
  }
})
