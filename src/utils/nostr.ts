import { bytesToHex } from '@noble/hashes/utils'
import { HDKey } from '@scure/bip32'
import { bech32 } from 'bech32'

// NIP-19: bech32-encoded entities
// https://github.com/nostr-protocol/nips/blob/master/19.md
const NOSTR_PUBLIC_KEY_PREFIX = 'npub'
const NOSTR_PRIVATE_KEY_PREFIX = 'nsec'

export type Nip19EncodedPublicKey = `${typeof NOSTR_PRIVATE_KEY_PREFIX}1${string}`
export type NostrPublicKey = {
  nip19: Nip19EncodedPublicKey
  hex: string
}

export type Nip19EncodedPrivateKey = `${typeof NOSTR_PRIVATE_KEY_PREFIX}1${string}`
export type NostrPrivateKey = {
  nip19: Nip19EncodedPrivateKey
  hex: string
}

const PUBKEY_LIMIT = NOSTR_PUBLIC_KEY_PREFIX.length + 7 + 128
const PRVKEY_LIMIT = NOSTR_PRIVATE_KEY_PREFIX.length + 7 + 128
const NIP06_DERIVATION_PATH = `m/44'/1237'/0'/0/0`

// https://github.com/nostr-protocol/nips/blob/master/06.md
const deriveNostrKey = (masterKey: HDKey): HDKey => {
  return masterKey.derive(NIP06_DERIVATION_PATH)
}

export const toNostrPublicKey = (publicKey: Uint8Array): NostrPublicKey => {
  const words = bech32.toWords(publicKey)
  const encoded = bech32.encode(NOSTR_PUBLIC_KEY_PREFIX, words, PUBKEY_LIMIT) as Nip19EncodedPublicKey
  return {
    nip19: encoded,
    hex: bytesToHex(publicKey),
  }
}

export const toNostrPrivateKey = (privateKey: Uint8Array): NostrPrivateKey => {
  const words = bech32.toWords(privateKey)
  const encoded = bech32.encode(NOSTR_PRIVATE_KEY_PREFIX, words, PRVKEY_LIMIT) as Nip19EncodedPrivateKey
  return {
    nip19: encoded,
    hex: bytesToHex(privateKey),
  }
}

export const deriveNostrPublicKey = (masterKey: HDKey): NostrPublicKey => {
  const key = deriveNostrKey(masterKey)
  if (key.publicKey === null) {
    throw new Error('Public Key not avialable')
  }
  return toNostrPublicKey(key.publicKey)
}

export const deriveNostrPrivateKey = (masterKey: HDKey): NostrPrivateKey => {
  const key = deriveNostrKey(masterKey)
  if (key.privateKey === null) {
    throw new Error('Private Key not avialable')
  }
  return toNostrPrivateKey(key.privateKey)
}
