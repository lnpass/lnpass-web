import { hmac } from '@noble/hashes/hmac'
import { sha256 } from '@noble/hashes/sha256'
import { Signature } from '@noble/secp256k1'
import { bytesToHex, hexToBytes, u32 } from '@noble/hashes/utils'
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

export const buildLnurlAuthUrl = (masterKey: HDKey, url: URL): URL => {
  const linkingKey = deriveLinkingKey(masterKey, url)
  if (linkingKey.publicKey === null) {
    throw new Error('Public key not available')
  }

  const k1Hex = url?.searchParams.get('k1')
  if (!k1Hex) {
    throw new Error('k1 not available')
  }
  const k1 = hexToBytes(k1Hex)

  const keyParam = bytesToHex(linkingKey.publicKey)
  const sig = linkingKey.sign(k1)
  const sigParam = Signature.fromCompact(bytesToHex(sig)).toDERHex()

  // <LNURL_hostname_and_path>?<LNURL_existing_query_parameters>&sig=<hex(sign(utf8ToBytes(k1), linkingPrivKey))>&key=<hex(linkingKey)>
  return new URL(url.toString() + `&sig=${sigParam}&key=${keyParam}`)
}

export const executeAuthRequest = async (url: URL, { signal }: { signal?: AbortSignal } = {}) => {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    let errorBody
    try {
      // {"status": "ERROR", "reason": "error details..."}
      errorBody = await res.json()
    } catch (e) {
      errorBody = { status: 'ERROR' }
    }
    throw new Error(errorBody.reason || 'Unknown reason')
  }
}
