import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Tooltip } from 'flowbite-react'
import {
  ArrowRightIcon,
  UserPlusIcon,
  PencilSquareIcon,
  BoltIcon,
  KeyIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/solid'
import { HDKey } from '@scure/bip32'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'

import { LnpassId, lnpassIdToSeed, seedToLnpassId } from './utils/lnpassId'
import { AccountEditModal } from './AccountEditModal'
import { LightningLoginModal } from './LightningLoginModal'
import { NostrKeysModal } from './components/NostrKeysModal'
import { lnpassAccountDerivationPath } from './utils/lnpass'
import { deriveEntropy } from './utils/bip85'
import { useNostrStorageContext } from './contexts/NostrStorageContext'
import { deriveNostrPrivateKey, deriveNostrPublicKey } from './utils/nostr'
import { getEventHash, signEvent, nip04 } from 'nostr-tools'

const LNPASS_NOSTR_EVENT_KIND = 10001 // replaceable
const LNPASS_NOSTR_EVENT_REF = bytesToHex(sha256('lnpass'))

interface AccountCardProps {
  account: Account
  edit: (account: Account) => void
  generateLoginHref?: (LnpassId: LnpassId) => string
  onClickLightning?: (account: Account) => void
  onClickNostr?: (account: Account) => void
}

function AccountCard({ account, edit, generateLoginHref, onClickLightning, onClickNostr }: AccountCardProps) {
  const subLnpassId = useMemo(() => {
    // just derive an lnpass id from the first "lnpass account" of this account
    const entropy = deriveEntropy(account.hdKey, lnpassAccountDerivationPath(0))
    return seedToLnpassId(entropy)
  }, [account])

  const subLnpassLoginHref = useMemo(() => {
    if (!generateLoginHref) return
    return generateLoginHref(subLnpassId)
  }, [generateLoginHref, subLnpassId])

  return (
    <Card>
      <div className="flex flex-row items-center">
        <h6 className="text-xl font-bold tracking-tighter">{account.name}</h6>
        <div className="flex flex-wrap ml-3">
          <Button color="light" size="xs" outline={true} onClick={() => edit(account)}>
            <PencilSquareIcon className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      </div>
      <div className="hidden">
        <div className="text-xs text-slate-500">{account.path}</div>
      </div>
      <div className="">
        <div className="text-slate-500">{account.description}</div>
      </div>

      <div className="flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          {onClickLightning && (
            <Button gradientDuoTone="tealToLime" outline={true} onClick={() => onClickLightning(account)}>
              <BoltIcon className="h-6 w-6 mr-3" />
              Login with Lightning
            </Button>
          )}
          {onClickNostr && (
            <Button gradientDuoTone="cyanToBlue" outline={true} onClick={() => onClickNostr(account)}>
              <KeyIcon className="h-6 w-6 mr-3" />
              Nostr Keys
            </Button>
          )}
        </div>
        {subLnpassLoginHref && (
          <div className="flex gap-2">
            <a href={subLnpassLoginHref} target="_blank" rel="noreferrer">
              <Button size="xs" gradientDuoTone="pinkToOrange" outline={true}>
                <ArrowTopRightOnSquareIcon className="h-6 w-6 mr-3" />
                lnpass
              </Button>
            </a>
          </div>
        )}
      </div>
    </Card>
  )
}

interface NostrAccountView {
  name: string
  description: string
  path: string
  deleted: boolean
}

interface NostrExportData {
  version: string
  accounts: NostrAccountView[]
}

interface IdentitiesPageProps {
  lnpassId: LnpassId
  generateLoginHref: (LnpassId: LnpassId) => string
}

export function IdentitiesPage({ lnpassId, generateLoginHref }: IdentitiesPageProps) {
  const nostrStorage = useNostrStorageContext()
  const [nostrStorageData, setNostrStorageData] = useState<NostrExportData>()
  const [nostrStorageError, setNostrStorageError] = useState<unknown>()

  const isInitialized = useMemo(() => {
    return !!nostrStorageData || !!nostrStorageError
  }, [nostrStorageData, nostrStorageError])

  const seed = useMemo(() => lnpassIdToSeed(lnpassId), [lnpassId])
  const masterKey = useMemo(() => HDKey.fromMasterSeed(seed), [seed])

  const createNewAccount = (parentKey: HDKey, path: string): Account => {
    const hdKey = parentKey.derive(path)
    return {
      name: `Identity #${hdKey.index}`,
      path,
      hdKey,
    }
  }
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showLightningLoginModal, setShowLightningLoginModal] = useState(false)
  const [showNostrModal, setShowNostrModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  const restoreAccount = (path: string, partial?: Partial<Account>) => {
    return { ...createNewAccount(masterKey, path), ...partial }
  }

  // TODO: should get entropy via https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki
  const addNewAccount = useCallback(() => {
    const newAccount = (() => {
      if (accounts.length === 0) {
        return restoreAccount(lnpassAccountDerivationPath(0))
      } else {
        const lastAccount = accounts[accounts.length - 1]
        return restoreAccount(lnpassAccountDerivationPath(lastAccount.hdKey.index + 1))
      }
    })()

    setAccounts((current) => [...current, newAccount])
  }, [accounts])

  const nostrPublicKey = useMemo(() => deriveNostrPublicKey(masterKey), [masterKey])
  const nostrPrivateKey = useMemo(() => deriveNostrPrivateKey(masterKey), [masterKey])

  useEffect(() => {
    const abortCtrl = new AbortController()
    nostrStorage
      .pullSingle(
        'ws://localhost:7000',
        [
          {
            kinds: [LNPASS_NOSTR_EVENT_KIND],
            authors: [nostrPublicKey.hex],
            '#e': [LNPASS_NOSTR_EVENT_REF],
          },
        ],
        abortCtrl.signal
      )
      .then((event) => {
        if (event === null) {
          setNostrStorageData({
            version: '1',
            accounts: [],
          })
          return
        }
        console.debug('Nostr incoming event', event)
        return nip04
          .decrypt(nostrPrivateKey.hex, nostrPublicKey.hex, event.content)
          .then((content) => JSON.parse(content) as NostrExportData)
          .then((data) => {
            if (abortCtrl.signal.aborted) return
            console.log('Found stored account data', data)
            setNostrStorageData(data)
          })
      })
      .catch((err) => {
        console.warn('Error while fetching event from nostr', err)
        setNostrStorageError(err)
      })

    return () => {
      abortCtrl.abort()
    }
  }, [nostrStorage, nostrPrivateKey, nostrPublicKey])

  useEffect(() => {
    if (accounts.length === 0) return

    const abortCtrl = new AbortController()

    const data: NostrExportData = {
      version: '1',
      accounts: accounts.map((it) => {
        return {
          name: it.name,
          description: it.description,
          path: it.path,
          deleted: false,
        } as NostrAccountView
      }),
    }

    nip04
      .encrypt(nostrPrivateKey.hex, nostrPublicKey.hex, JSON.stringify(data))
      .then((ciphertext) => {
        if (abortCtrl.signal.aborted) return
        let event = {
          id: '',
          sig: '',
          kind: LNPASS_NOSTR_EVENT_KIND,
          pubkey: nostrPublicKey.hex,
          created_at: Math.floor(Date.now() / 1000),
          tags: [['e', LNPASS_NOSTR_EVENT_REF]],
          content: ciphertext,
        }
        event.id = getEventHash(event)
        event.sig = signEvent(event, nostrPrivateKey.hex)

        return nostrStorage.pushSingle('ws://localhost:7000', event, abortCtrl.signal).then((event) => {
          console.debug('Nostr outgoing event', event)
        })
      })
      .catch((err) => {
        console.warn('Error while pushing event to nostr', err)
      })

    return () => {
      abortCtrl.abort()
    }
  }, [accounts, nostrStorage, nostrPublicKey, nostrPrivateKey])

  useEffect(() => {
    if (!nostrStorageData) return

    const restoredAccounts = nostrStorageData.accounts.map((it) => {
      return restoreAccount(it.path, it)
    })
    setAccounts(restoredAccounts)
  }, [nostrStorageData])

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tighter">Identities</h2>

      <>{!isInitialized && <>Loading...</>}</>

      <div className="mt-2 mb-4">
        {accounts.length === 0 ? (
          <div className="cursor-pointer" onClick={() => addNewAccount()}>
            <Card>
              <div className="flex flex-row items-center gap-4">
                <div className="text-3xl">👋</div>
                <div className="flex-1">
                  <span>Hey there!</span>
                  <p>Go ahead, create your first identity</p>
                </div>
                <div>
                  <ArrowRightIcon className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex mb-4">
              <Tooltip content="Let's go!">
                <Button gradientDuoTone="purpleToBlue" onClick={() => addNewAccount()}>
                  <UserPlusIcon className="h-6 w-6 mr-3" />
                  New identity
                </Button>
              </Tooltip>
            </div>
            {selectedAccount && (
              <>
                <LightningLoginModal
                  account={selectedAccount}
                  show={showLightningLoginModal}
                  onClose={() => setShowLightningLoginModal(false)}
                />
                <NostrKeysModal
                  account={selectedAccount}
                  show={showNostrModal}
                  onClose={() => setShowNostrModal(false)}
                />
                <AccountEditModal
                  account={selectedAccount}
                  onSave={(info) => {
                    selectedAccount.name = info.name
                    selectedAccount.description = info.description
                    setShowEditModal(false)
                  }}
                  show={showEditModal}
                  onClose={() => setShowEditModal(false)}
                />
              </>
            )}
            {accounts.map((it) => (
              <div key={it.hdKey.index} className="mb-2">
                <AccountCard
                  account={it}
                  edit={(account) => {
                    setSelectedAccount(account)
                    setShowEditModal(true)
                  }}
                  generateLoginHref={generateLoginHref}
                  onClickLightning={(account) => {
                    setSelectedAccount(account)
                    setShowLightningLoginModal(true)
                  }}
                  onClickNostr={(account) => {
                    setSelectedAccount(account)
                    setShowNostrModal(true)
                  }}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </>
  )
}
