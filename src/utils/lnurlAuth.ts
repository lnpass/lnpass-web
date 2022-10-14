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
