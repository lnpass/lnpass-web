import { useMemo, useState } from 'react'
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
import { LnpassId, lnpassIdToSeed, seedToLnpassId } from './utils/lnpassId'
import { AccountEditModal } from './AccountEditModal'
import { LightningLoginModal } from './LightningLoginModal'
import { NostrKeysModal } from './components/NostrKeysModal'
import { lnpassAccountDerivationPath } from './utils/lnpass'
import { deriveEntropy } from './utils/bip85'

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

interface IdentitiesPageProps {
  lnpassId: LnpassId
  generateLoginHref: (LnpassId: LnpassId) => string
}

export function IdentitiesPage({ lnpassId, generateLoginHref }: IdentitiesPageProps) {
  const seed = useMemo(() => lnpassIdToSeed(lnpassId), [lnpassId])
  const masterKey = useMemo(() => HDKey.fromMasterSeed(seed), [seed])

  const toAccount = (parentKey: HDKey, path: string): Account => {
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

  // TODO: should get entropy via https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki
  const addNewAccount = () => {
    const newAccount = (() => {
      if (accounts.length === 0) {
        return toAccount(masterKey, lnpassAccountDerivationPath(0))
      } else {
        const lastAccount = accounts[accounts.length - 1]
        return toAccount(masterKey, lnpassAccountDerivationPath(lastAccount.hdKey.index + 1))
      }
    })()

    setAccounts((current) => [...current, newAccount])
  }

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tighter">Identities</h2>

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
