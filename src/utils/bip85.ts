import { HDKey } from '@scure/bip32'
import { hmac } from '@noble/hashes/hmac'
import { sha512 } from '@noble/hashes/sha512'

export const deriveEntropy = (hdKey: HDKey, derivationPath: string): Uint8Array => {
  const key = hdKey.derive(derivationPath)
  if (key.privateKey === null) {
    throw new Error('Private Key not available')
  }

  return hmac(sha512, 'bip-entropy-from-k', key.privateKey)
}
