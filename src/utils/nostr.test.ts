import { hexToBytes } from '@noble/hashes/utils'
import { toNostrPublicKey, toNostrPrivateKey } from './nostr'

describe('nostr', () => {
  it('should encode nostr pubkey', () => {
    // from https://github.com/nostr-protocol/nips/blob/master/19.md
    const pubkeyHex = '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d'

    const encoded = toNostrPublicKey(hexToBytes(pubkeyHex))
    expect(encoded).toBe('npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6')
  })

  it('should encode nostr prvkey', () => {
    const encoded = toNostrPrivateKey(hexToBytes('0123456789abcdef'))
    expect(encoded).toBe('nsec1qy352euf40x77g7rg9e')
  })
})
