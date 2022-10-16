import { hmac } from '@noble/hashes/hmac'
import { sha256 } from '@noble/hashes/sha256'
import { u32 } from '@noble/hashes/utils'
import { HDKey } from '@scure/bip32'
import { bech32 } from 'bech32'

const removePrefixIfNecessary = (prefix: string, data: string) => {
  if (data.length >= prefix.length) {
    const possiblePrefix = data.substring(0, prefix.length)
    if (possiblePrefix.toLowerCase().startsWith(prefix.toLowerCase())) {
      return data.substring(prefix.length, data.length)
    }
  }
  return data
}

const removeLightningPrefixIfNecessary = (data: string) => {
  return removePrefixIfNecessary('lightning:', data)
}

const bufferToString = (arr: number[]) => {
  return arr.map((it) => String.fromCharCode(it)).join('')
}

export const decodeLnurlAuthRequest = (data: string) => {
  const sanitized = removeLightningPrefixIfNecessary(data)
  const decoded = bech32.decode(sanitized, sanitized.length)
  if (decoded.prefix !== 'lnurl') {
    throw new Error(`Unexpected prefix. Should be 'lnurl', was: ${decoded.prefix}`)
  }
  const words = bech32.fromWords(decoded.words)
  return bufferToString(words)
}

// https://github.com/fiatjaf/lnurl-rfc/blob/legacy/lnurl-auth.md#linkingkey-derivation
export const deriveLinkingKey = (masterKey: HDKey, url: URL): HDKey => {
  const hashingKey = masterKey.derive(`m/138'/0`)

  if (hashingKey.privateKey === null) {
    throw new Error('Private key not available')
  }

  const derivationMaterial = hmac(sha256, hashingKey.privateKey, url.hostname)
  const stream = derivationMaterial.subarray(0, 16)

  if (stream.length !== 16) {
    throw new Error('Insufficient derivation material')
  }

  const longs = u32(stream)
  return masterKey
    .derive(`m/138'`)
    .deriveChild(longs[0])
    .deriveChild(longs[1])
    .deriveChild(longs[2])
    .deriveChild(longs[3])
}
