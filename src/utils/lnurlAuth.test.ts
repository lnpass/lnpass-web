import { decodeLnurlAuthRequest } from './lnurlAuth'

describe('lnurlAuth', () => {
  it('should decode lnurl-auth request', () => {
    const lnurl =
      'LNURL1DP68GURN8GHJ7MRFVA58GMNFDENKCMM8D9HZUMRFWEJJ7MR0VA5KU0MTXY7NVVPEVSURSCNYXUUNWCT98PJRVERXV4JXGVMXX5UNXC34XYMRYVPCVCMXYVF5XUCRWEPEXV6R2D35VSEKYCE3VG6RZWRYXFNXYDRPVGN8GCT884KX7EMFDCA5A27F'
    const expected =
      'https://lightninglogin.live/login?k1=609d88bd797ae8d6dfedd3f593b516208f6b14707d934564d3bc1b418d2fb4ab&tag=login'

    const prefixes = ['', 'lightning:', 'LIGHTNING:']

    prefixes.forEach((prefix) => {
      const data = `${prefix}${lnurl}`
      const decoded = decodeLnurlAuthRequest(data)
      expect(decoded).toBe(expected)
    })
  })
})
