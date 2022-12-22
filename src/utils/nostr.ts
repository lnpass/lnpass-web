import { bech32 } from 'bech32'

// NIP-19: bech32-encoded entities
// https://github.com/nostr-protocol/nips/blob/master/19.md
const NOSTR_PUBLIC_KEY_PREFIX = 'npub'
const NOSTR_PRIVATE_KEY_PREFIX = 'nsec'

export type NostrPubKey = `${typeof NOSTR_PUBLIC_KEY_PREFIX}1${string}`
export type NostrPrvKey = `${typeof NOSTR_PRIVATE_KEY_PREFIX}1${string}`

const PUBKEY_LIMIT = NOSTR_PUBLIC_KEY_PREFIX.length + 7 + 128
const PRVKEY_LIMIT = NOSTR_PRIVATE_KEY_PREFIX.length + 7 + 128

export const toNostrPublicKey = (publicKey: Uint8Array): NostrPubKey => {
  const words = bech32.toWords(publicKey)
  const encoded = bech32.encode(NOSTR_PUBLIC_KEY_PREFIX, words, PUBKEY_LIMIT) as NostrPubKey
  return encoded
}

export const toNostrPrivateKey = (privateKey: Uint8Array): NostrPubKey => {
  const words = bech32.toWords(privateKey)
  const encoded = bech32.encode(NOSTR_PRIVATE_KEY_PREFIX, words, PRVKEY_LIMIT) as NostrPubKey
  return encoded
}
