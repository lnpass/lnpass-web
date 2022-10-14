
import { hexToBytes, bytesToHex, randomBytes } from '@noble/hashes/utils'
import { lnpassIdToSeed, seedToLnpassId } from './lnpassId'

describe('lnpassId', () => {

  it('should encode lnpass id', () => {
    const encoded = seedToLnpassId(hexToBytes('0123456789abcdef'))
    expect(encoded).toBe('lnpass1qy352euf40x77jux3e4')
  })
  
  it('should decode lnpass id', () => {
    const decoded = bytesToHex(lnpassIdToSeed('lnpass1qy352euf40x77jux3e4'))
    expect(decoded).toBe('0123456789abcdef')
  })

  it('should verify encode/decode are inverse functions', () => {
    const input = bytesToHex(randomBytes(64))
    const encoded = seedToLnpassId(hexToBytes(input))
    const decoded = lnpassIdToSeed(encoded)
    expect(bytesToHex(decoded)).toBe(input)
  })
  
})