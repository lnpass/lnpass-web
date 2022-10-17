import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
  Outlet,
} from 'react-router-dom'
import { Button, Card, Label, Modal, ModalProps, Textarea, TextInput, Tooltip } from 'flowbite-react'
import { ArrowRightIcon, UserPlusIcon, CheckCircleIcon, BoltIcon } from '@heroicons/react/24/solid'
import { HDKey } from '@scure/bip32'
import { randomBytes } from '@noble/hashes/utils'
import { LnpassId, lnpassIdToSeed, seedToLnpassId, toLnpassIdOrThrow } from './utils/lnpassId'
import { buildLnurlAuthUrl, decodeLnurlAuthRequest } from './utils/lnurlAuth'
import { Sidebar } from './Sidebar'
import './App.css'

interface Account {
  path: string
  hdKey: HDKey
}

type ActionEnum = 'register' | 'login' | 'link' | 'auth' | null

interface LoginModalProps extends ModalProps {
  account: Account
}

function LoginModal({ account, show, onClose }: LoginModalProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [lnurlAuthRequestInput, setLnurlAuthRequestInput] = useState('')

  const url = useMemo(() => {
    if (!lnurlAuthRequestInput) return null

    try {
      return new URL(decodeLnurlAuthRequest(lnurlAuthRequestInput))
    } catch (e) {
      return null
    }
  }, [lnurlAuthRequestInput])

  const action = useMemo<ActionEnum>(() => (url ? (url.searchParams.get('action') as ActionEnum) : null), [url])

  const authUrl = useMemo(() => {
    if (url === null) return null
    try {
      return buildLnurlAuthUrl(account.hdKey, url)
    } catch (e) {
      return null
    }
  }, [account.hdKey, url])

  useEffect(() => {
    if (!show) {
      setLnurlAuthRequestInput('')
    }
  }, [show])

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Login with {account.path}</Modal.Header>
      <Modal.Body>
        <>
          <div className="">
            <div className="hidden">
              <Label htmlFor="lnurlAuthRequest" value="lnurl-auth Request" />
            </div>
            <Textarea
              id="lnurlAuthRequest"
              placeholder="lightning:lnurl1..."
              required={true}
              rows={4}
              value={lnurlAuthRequestInput}
              onChange={(e) => setLnurlAuthRequestInput(e.target.value)}
            />
          </div>

          {url && (
            <div className="mt-4 text-2xl flex items-center gap-2">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              {url.hostname}
              {action && <>: {action}</>}
            </div>
          )}
        </>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex flex-col w-full">
          {!authUrl ? (<Button gradientDuoTone="purpleToBlue" disabled>
            Login
          </Button>) : (<>
            <Button gradientDuoTone="purpleToBlue" onClick={() => linkRef.current?.click()}>
              Login to {authUrl.hostname}
            </Button>
            <a ref={linkRef} className="hidden"
              href={authUrl.toString()} target="_lnpassAuth" rel="noopener noreferrer">
              Login to {authUrl.hostname}
            </a>
          </>)}
        </div>
      </Modal.Footer>
    </Modal>
  )
}
interface AccountCardProps {
  account: Account
}
function AccountCard({ account }: AccountCardProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <Card>
      <pre>{JSON.stringify(account, null, 2)}</pre>

      <div className="w-1/4">
        <Button gradientDuoTone="purpleToBlue" size="xl" onClick={() => setShowLoginModal(true)}>
          <BoltIcon className="h-8 w-8 pr-1" />
          Login with Lightning
        </Button>
      </div>
      <LoginModal account={account} show={showLoginModal} onClose={() => setShowLoginModal(false)} />
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
  const hdkey = useMemo(() => HDKey.fromMasterSeed(seed), [seed])

  const toAccount = (hdKey: HDKey, path: string): Account => {
    return {
      path,
      hdKey: hdKey.derive(path),
    }
  }
  const [accounts, setAccounts] = useState<Account[]>([])

  // TODO: should get entropy via https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki
  const addNewAccount = () => {
    const app_no = 19557 // sha256('lnpass') := 0x4c65... := 19557
    const basePath = `m/83696968'/${app_no}`

    if (accounts.length === 0) {
      setAccounts((current) => [...current, toAccount(hdkey, `${basePath}/0`)])
    } else {
      setAccounts((current) => {
        const lastAccount = accounts[accounts.length - 1]
        const newAccount = toAccount(hdkey, `${basePath}/${lastAccount.hdKey.index + 1}`)
        return [...current, newAccount]
      })
    }
  }

  return (
    <div className="p-2">
      <h2 className="text-3xl font-bold">Identities</h2>
      <div className="text-lg">{lnpassId}</div>

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
            {accounts.map((it) => (
              <div key={it.hdKey.index} className="mb-2">
                <AccountCard account={it} />
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
