import { useMemo, useState } from 'react'
import { Button, Card, Tooltip } from 'flowbite-react'
import { ArrowRightIcon, UserPlusIcon, PencilSquareIcon, BoltIcon } from '@heroicons/react/24/solid'
import { HDKey } from '@scure/bip32'
import { LnpassId, lnpassIdToSeed } from './utils/lnpassId'
import { AccountEditModal } from './AccountEditModal'
import { LightningLoginModal } from './LightningLoginModal'

interface AccountCardProps {
  account: Account
  edit: (account: Account) => void
  loginWithLightning: (account: Account) => void
}

function AccountCard({ account, edit, loginWithLightning }: AccountCardProps) {
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

      <div className="w-64">
        <Button gradientDuoTone="purpleToBlue" onClick={() => loginWithLightning(account)}>
          <BoltIcon className="h-8 w-8 pr-1" />
          Login with Lightning
        </Button>
      </div>
    </Card>
  )
}

interface IdentitiesPageProps {
  lnpassId: LnpassId
}

export function IdentitiesPage({ lnpassId }: IdentitiesPageProps) {
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
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  // TODO: should get entropy via https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki
  const addNewAccount = () => {
    const newAccount = (() => {
      const app_no = 19557 // sha256('lnpass') := 0x4c65... := 19557
      const basePath = `m/83696968'/${app_no}`

      if (accounts.length === 0) {
        return toAccount(masterKey, `${basePath}/0`)
      } else {
        const lastAccount = accounts[accounts.length - 1]
        return toAccount(masterKey, `${basePath}/${lastAccount.hdKey.index + 1}`)
      }
    })()

    setAccounts((current) => [...current, newAccount])
  }

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tighter">Identities</h2>
      <div className="hidden text-sm text-slate-500">{lnpassId}</div>

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
            <div className="flex-none mb-4">
              <Tooltip content="Let's go!">
                <Button outline={true} gradientDuoTone="purpleToBlue" onClick={() => addNewAccount()}>
                  <UserPlusIcon className="h-6 w-6" />
                </Button>
              </Tooltip>
            </div>
            {selectedAccount && (
              <>
                <LightningLoginModal
                  account={selectedAccount}
                  show={showLoginModal}
                  onClose={() => setShowLoginModal(false)}
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
                  loginWithLightning={(account) => {
                    setSelectedAccount(account)
                    setShowLoginModal(true)
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
