import { useMemo, useState } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
  Outlet,
} from 'react-router-dom'
import { Button, Card, Label, TextInput, Tooltip } from 'flowbite-react'
import { ArrowRightIcon, UserPlusIcon, BoltIcon, PencilSquareIcon } from '@heroicons/react/24/solid'
import { HDKey } from '@scure/bip32'
import { randomBytes } from '@noble/hashes/utils'
import { LnpassId, lnpassIdToSeed, seedToLnpassId, toLnpassIdOrThrow } from './utils/lnpassId'
import { AccountEditModal } from './AccountEditModal'
import { LoginModal } from './LoginModal'
import { Sidebar } from './Sidebar'
import './App.css'

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

interface IndexProps {
  lnpassId?: LnpassId
}
function Index({ lnpassId }: IndexProps) {
  if (!lnpassId) {
    return <Navigate to="/login" replace={true} />
  } else {
    return <Main lnpassId={lnpassId} />
  }
}
interface MainProps {
  lnpassId: LnpassId
}
function Main({ lnpassId }: MainProps) {
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
    setSelectedAccount(newAccount)
    setShowEditModal(true)
  }

  return (
    <div className="w-full p-2">
      <h2 className="text-3xl font-bold tracking-tighter">Identities</h2>
      <div className="hidden text-sm text-slate-500">{lnpassId}</div>

      <div className="mt-4">
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
            {selectedAccount && (
              <>
                <LoginModal account={selectedAccount} show={showLoginModal} onClose={() => setShowLoginModal(false)} />
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
            <div className="flex-none mt-4">
              <Tooltip content="Let's go!">
                <Button outline={true} gradientDuoTone="purpleToBlue" size="xl" onClick={() => addNewAccount()}>
                  <UserPlusIcon className="h-6 w-6" />
                </Button>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface LoginProps {
  onSubmit: (id: LnpassId) => void
}
function Login({ onSubmit }: LoginProps) {
  const [lnpassIdInput, setLnpassIdInput] = useState('')

  const onNewButtonClicked = () => {
    const random = randomBytes(64)
    const lnpassId = seedToLnpassId(random)
    setLnpassIdInput(lnpassId)
    setTimeout(() => {
      onSubmit(lnpassId)
    }, 4)
  }

  const onSubmitButtonClicked = () => {
    try {
      onSubmit(toLnpassIdOrThrow(lnpassIdInput))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex h-screen justify-center items-center text-3xl">
      <div className="w-full max-w-7xl">
        <Card>
          <div className="flex justify-center">Welcome</div>
          <div>
            <div className="hidden">
              <Label htmlFor="lnpass1" value="lnpass1" />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <div className="flex-1">
                <TextInput
                  id="lnpass1"
                  type="text"
                  sizing="lg"
                  placeholder="lnpass1..."
                  value={lnpassIdInput}
                  onChange={(e) => setLnpassIdInput(e.target.value)}
                />
              </div>
              <div className="flex-none">
                <Tooltip content="Let's go!">
                  <Button
                    outline={true}
                    gradientDuoTone="purpleToBlue"
                    size="xl"
                    onClick={() => onSubmitButtonClicked()}
                  >
                    <ArrowRightIcon className="h-6 w-6" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="text-sm">... or create new ...</div>
          </div>
          <div className="flex justify-center">
            <Tooltip content="Create a new identity pool!">
              <Button outline={true} gradientDuoTone="purpleToBlue" size="xl" onClick={() => onNewButtonClicked()}>
                <div className="text-xl">Create</div>
              </Button>
            </Tooltip>
          </div>
        </Card>
      </div>
    </div>
  )
}

function App() {
  const [lnpassId, setLnpassId] = useState<LnpassId>()

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        id="base"
        element={
          <div>
            <Outlet />
          </div>
        }
      >
        <Route
          id="parent"
          element={
            <div className="flex flex-row">
              <Sidebar
                logout={() => {
                  setLnpassId(undefined)
                }}
              />
              <Outlet />
            </div>
          }
        >
          <Route id="home" path="/" index element={<Index lnpassId={lnpassId} />} />
        </Route>
        <Route
          id="login"
          path="/login"
          index
          element={
            lnpassId ? (
              <Navigate to="/" replace={true} />
            ) : (
              <Login
                onSubmit={(lnpassId) => {
                  setLnpassId(lnpassId)
                }}
              />
            )
          }
        />
        <Route id="404" path="*" element={<Navigate to="/" replace={true} />} />
      </Route>
    )
  )

  return <RouterProvider router={router} />
}

export default App
