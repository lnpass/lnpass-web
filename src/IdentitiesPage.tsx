import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Spinner, Tooltip } from 'flowbite-react'
import { ArrowRightIcon, UserPlusIcon } from '@heroicons/react/24/solid'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'
import { Event, getEventHash, signEvent, nip04 } from 'nostr-tools'

import { deriveNostrKeys } from './utils/nostr'
import { LnpassId, lnpassIdToHDKey } from './utils/lnpassId'
import { NostrStorageContextEntry, useNostrStorageContext } from './contexts/NostrStorageContext'
import { useAccountsContext } from './contexts/AccountsContext'
import { AccountEditModal } from './components/AccountEditModal'
import { LightningLoginModal } from './components/LightningLoginModal'
import { NostrKeysModal } from './components/NostrKeysModal'
import { AccountCard } from './components/AccountCard'

const LNPASS_NOSTR_EVENT_KIND = 10_001 // replaceable
const LNPASS_NOSTR_EVENT_REF = bytesToHex(sha256('lnpass'))

const toNostrKeys = (lnpassId: LnpassId) => {
  return deriveNostrKeys(lnpassIdToHDKey(lnpassId))
}

const pullDataFromNostr = (
  lnpassId: LnpassId,
  host: string,
  nostrStorage: NostrStorageContextEntry,
  signal: AbortSignal
): Promise<NostrExportData | null> => {
  const [nostrPublicKey, nostrPrivateKey] = toNostrKeys(lnpassId)

  return nostrStorage
    .pullSingle(
      host,
      [
        {
          kinds: [LNPASS_NOSTR_EVENT_KIND],
          authors: [nostrPublicKey.hex],
          '#e': [LNPASS_NOSTR_EVENT_REF],
        },
      ],
      signal
    )
    .then((event) => {
      if (event === null) {
        return null
      }
      console.debug('Nostr incoming event', event)
      return nip04
        .decrypt(nostrPrivateKey.hex, nostrPublicKey.hex, event.content)
        .then((content) => JSON.parse(content) as NostrExportData)
    })
}

const pushDataFromNostr = (
  lnpassId: LnpassId,
  host: string,
  nostrStorage: NostrStorageContextEntry,
  signal: AbortSignal,
  data: NostrExportData
): Promise<Event> => {
  const [nostrPublicKey, nostrPrivateKey] = toNostrKeys(lnpassId)

  return nip04.encrypt(nostrPrivateKey.hex, nostrPublicKey.hex, JSON.stringify(data)).then((ciphertext) => {
    if (signal.aborted) {
      throw new Error('Pushing to nostr has been aborted')
    }
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

    return nostrStorage.pushSingle(host, event, signal)
  })
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
  const { accounts, addNewAccount, restoreAccount, updateAccount, clearAccounts } = useAccountsContext()

  const nostrStorage = useNostrStorageContext()

  const [isNostrStoragePulling, setIsNostrStoragePulling] = useState<boolean>(false)
  const [isNostrStoragePushing, setIsNostrStoragePushing] = useState<boolean>(false)
  const isNostrStorageLoading = useMemo(
    () => isNostrStoragePulling || isNostrStoragePushing,
    [isNostrStoragePulling, isNostrStoragePushing]
  )
  const [nostrStorageIncomingData, setNostrStorageIncomingData] = useState<NostrExportData>()
  const [nostrStorageIncomingError, setNostrStorageIncomingError] = useState<unknown>()

  const nostrNeedsInitialSync = useMemo(() => {
    if (nostrStorageIncomingData === undefined) return true
    return nostrStorageIncomingError !== undefined
  }, [nostrStorageIncomingData, nostrStorageIncomingError])
  // sync `accounts => nostr (outgoing)`
  const nostrStorageOutgoingData = useMemo(() => {
    if (!accounts) return

    return {
      version: '1',
      accounts: accounts.map((it) => {
        return {
          name: it.name,
          description: it.description,
          path: it.path,
          deleted: false,
        } as NostrAccountView
      }),
    } as NostrExportData
  }, [accounts])

  const needsNostrPush = useMemo(() => {
    if (!nostrStorageIncomingData) return false
    if (!nostrStorageOutgoingData) return false
    return JSON.stringify(nostrStorageIncomingData) !== JSON.stringify(nostrStorageOutgoingData)
  }, [nostrStorageIncomingData, nostrStorageOutgoingData])

  const [showLightningLoginModal, setShowLightningLoginModal] = useState(false)
  const [showNostrModal, setShowNostrModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  // sync `nostr (incoming) => accounts`
  useEffect(() => {
    if (!nostrStorageIncomingData) return

    clearAccounts()
    nostrStorageIncomingData.accounts.map((it) => {
      return restoreAccount(it.path, it)
    })
  }, [nostrStorageIncomingData, restoreAccount, clearAccounts])

  const syncAccountsFromNostr = useCallback(
    ({ signal }: { signal: AbortSignal }) => {
      setIsNostrStoragePulling(true)
      return pullDataFromNostr(lnpassId, 'ws://localhost:7000', nostrStorage, signal)
        .then(
          (data) =>
            data || {
              version: '1',
              accounts: [],
            }
        )
        .then((data) => {
          if (signal.aborted) return
          setIsNostrStoragePulling(false)
          setNostrStorageIncomingError(undefined)
          setNostrStorageIncomingData(data)
        })
        .catch((err) => {
          console.warn('Error while fetching event from nostr', err)

          if (signal.aborted) return
          setIsNostrStoragePulling(false)
          setNostrStorageIncomingError(err)
        })
    },
    [lnpassId, nostrStorage]
  )

  const syncAccountsToNostr = useCallback(
    ({ signal }: { signal: AbortSignal }) => {
      if (!nostrStorageOutgoingData) return

      setIsNostrStoragePushing(true)

      pushDataFromNostr(lnpassId, 'ws://localhost:7000', nostrStorage, signal, nostrStorageOutgoingData)
        .then((event) => {
          console.debug('Nostr outgoing event', event)

          if (signal.aborted) return
          setIsNostrStoragePushing(false)
          return syncAccountsFromNostr({ signal })
        })
        .catch((err) => {
          console.warn('Error while pushing event to nostr', err)

          if (signal.aborted) return
          setIsNostrStoragePushing(false)
        })
    },
    [lnpassId, nostrStorage, nostrStorageOutgoingData, syncAccountsFromNostr]
  )

  // initialize by pulling data from nostr
  useEffect(() => {
    if (!nostrNeedsInitialSync) return
    const abortCtrl = new AbortController()
    syncAccountsFromNostr({ signal: abortCtrl.signal })

    return () => {
      abortCtrl.abort()
    }
  }, [nostrNeedsInitialSync, syncAccountsFromNostr])

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tighter">Identities</h2>

      {nostrStorageIncomingData && (
        <div className="flex flex-row gap-2 justify-start items-center">
          <Button
            outline={true}
            gradientDuoTone="purpleToBlue"
            size="xs"
            disabled={isNostrStoragePulling}
            onClick={() => {
              const abortCtrl = new AbortController()
              syncAccountsFromNostr({ signal: abortCtrl.signal })
            }}
          >
            {isNostrStorageLoading && (
              <Spinner className="mr-2" color="purple" aria-label="Pulling from nostr" size="xs" />
            )}{' '}
            Sync from nostr
          </Button>
          <div>
            <Button
              outline={!needsNostrPush}
              gradientDuoTone="purpleToBlue"
              size="xs"
              disabled={isNostrStoragePushing}
              onClick={() => {
                const abortCtrl = new AbortController()
                syncAccountsToNostr({ signal: abortCtrl.signal })
              }}
            >
              {isNostrStoragePushing && (
                <Spinner className="mr-2" color="purple" aria-label="Pushing to nostr" size="xs" />
              )}
              Sync to nostr
            </Button>
          </div>
        </div>
      )}

      <div className="mt-2 mb-4">
        {}
        {!accounts || accounts.length === 0 ? (
          <>
            {nostrNeedsInitialSync && isNostrStoragePulling ? (
              <>
                <div className="flex flex-col gap-2 justify-center items-center">
                  <Spinner className="mr-2" color="purple" aria-label="Syncing from nostr" size="xl" />
                  Syncing from nostr...
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2 justify-center items-center">
                  <div className="cursor-pointer w-full" onClick={() => addNewAccount()}>
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
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="flex mb-4 justify-start">
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
                  show={showEditModal}
                  onClose={() => setShowEditModal(false)}
                  onSave={(info) => {
                    selectedAccount.name = info.name
                    selectedAccount.description = info.description
                    updateAccount(selectedAccount)
                    setShowEditModal(false)
                  }}
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
