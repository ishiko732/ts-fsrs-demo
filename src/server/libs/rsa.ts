import { constants, privateDecrypt, publicEncrypt } from 'crypto'

function decrypt(privateKey: string, encrypted: string): string {
  try {
    const decrypted = privateDecrypt(
      {
        key: privateKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      new Uint8Array(Buffer.from(encrypted, 'base64')),
    )
    return decrypted.toString('utf-8')
  } catch (e) {
    const err = e as Error
    console.error(`decrypt error: ${err.message}`)
    throw e
  }
}

function encrypt(publicKey: string, data: string): string {
  try {
    const encrypted = publicEncrypt(
      {
        key: publicKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      new Uint8Array(Buffer.from(data, 'utf-8')),
    )

    return encrypted.toString('base64')
  } catch (e) {
    const err = e as Error
    console.error(`encrypt error: ${err.message}`)
    throw e
  }
}

export { decrypt, encrypt }
