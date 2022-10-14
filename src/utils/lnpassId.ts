import { bech32m } from 'bech32'

const LNPASS_ID_PREFIX = 'lnpass'

export type LnpassId = `${typeof LNPASS_ID_PREFIX}1${string}`

type Seed = Uint8Array

const LIMIT = LNPASS_ID_PREFIX.length + 7 + 128

export const seedToLnpassId = (seed: Seed): LnpassId => {
  const words = bech32m.toWords(seed)
  const encoded = bech32m.encode(LNPASS_ID_PREFIX, words, LIMIT) as LnpassId
  return encoded
}

export const lnpassIdToSeed = (id: LnpassId): Seed => {
  const decoded = bech32m.decode(id, LIMIT)
  if (decoded.prefix !== LNPASS_ID_PREFIX) {
    throw new Error('Cannot decode lnpassId: invalid prefix')
  }
  return Uint8Array.from(bech32m.fromWords(decoded.words))
}

export const toLnpassIdOrThrow = (idLike: string) => {
  return seedToLnpassId(lnpassIdToSeed(idLike as LnpassId))
}
