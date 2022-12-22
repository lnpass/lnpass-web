declare type HDKey = import('@scure/bip32').HDKey

interface Account {
  name: string
  description?: string
  path: string
  hdKey: HDKey
}
