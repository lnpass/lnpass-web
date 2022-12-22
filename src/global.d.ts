declare type Bip32HDKey = import('@scure/bip32').HDKey

interface Account {
  name: string
  description?: string
  path: string
  hdKey: Bip32HDKey
}
