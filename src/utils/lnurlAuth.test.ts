import { decodeLnurlAuthRequest } from './lnurlAuth'

describe('lnurlAuth', () => {
  describe('decodeLnurlAuthRequest', () => {
    const lnurl =
      'LNURL1DP68GURN8GHJ7MRFVA58GMNFDENKCMM8D9HZUMRFWEJJ7MR0VA5KU0MTXY7NVVPEVSURSCNYXUUNWCT98PJRVERXV4JXGVMXX5UNXC34XYMRYVPCVCMXYVF5XUCRWEPEXV6R2D35VSEKYCE3VG6RZWRYXFNXYDRPVGN8GCT884KX7EMFDCA5A27F'
    const expected =
      'https://lightninglogin.live/login?k1=609d88bd797ae8d6dfedd3f593b516208f6b14707d934564d3bc1b418d2fb4ab&tag=login'

    it('should decode lnurl-auth request', () => {
      const decoded = decodeLnurlAuthRequest(lnurl)
      expect(decoded).toBe(expected)
    })

    it('should decode lnurl-auth request case-insensitive', () => {
      const decodedUpper = decodeLnurlAuthRequest(lnurl.toUpperCase())
      const decodedLower = decodeLnurlAuthRequest(lnurl.toLowerCase())
      expect(decodedLower).toBe(decodedUpper)
      expect(decodedLower).toBe(expected)
    })

    it('should handle lnurl-auth request with prefixes', () => {
      const prefixes = ['', 'lightning:', 'LIGHTNING:']

      prefixes.forEach((prefix) => {
        const data = `${prefix}${lnurl}`
        const decoded = decodeLnurlAuthRequest(data)
        expect(decoded).toBe(expected)
      })
    })
  })
})
