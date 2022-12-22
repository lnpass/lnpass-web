/**
 * @jest-environment node
 *
 * Must set jest environment to node, otherwise fails with:
 * "TypeError: Expected input type is Uint8Array (got object)"
 */
import { hexToBytes, randomBytes } from '@noble/hashes/utils'
import { HDKey } from '@scure/bip32'
import { toNostrPublicKey, toNostrPrivateKey, deriveNostrPrivateKey } from './nostr'

describe('nostr', () => {
  it('should encode nostr pubkey', () => {
    // from https://github.com/nostr-protocol/nips/blob/master/19.md
    const pubkeyHex = '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d'

    const pubkey = toNostrPublicKey(hexToBytes(pubkeyHex))
    expect(pubkey.nip19).toBe('npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6')
    expect(pubkey.hex).toBe(pubkeyHex)
  })

  it('should encode nostr prvkey', () => {
    const privkeyHex = '0123456789abcdef'

    const encoded = toNostrPrivateKey(hexToBytes(privkeyHex))
    expect(encoded.nip19).toBe('nsec1qy352euf40x77g7rg9e')
    expect(encoded.hex).toBe(privkeyHex)
  })

  it('should derive nostr keys from hd seed', () => {
    const seed = randomBytes(32)
    const masterKey = HDKey.fromMasterSeed(seed)
    const encoded = deriveNostrPrivateKey(masterKey)
    expect(encoded.nip19).toMatch(new RegExp(`^nsec1.*`))
    expect(encoded.hex).toBeDefined()
  })
})
