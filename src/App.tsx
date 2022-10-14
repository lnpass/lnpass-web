import { useMemo, useRef, useState } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
  Outlet,
} from 'react-router-dom'
import { Button, Card, Label, TextInput, Tooltip } from 'flowbite-react'
import { HDKey } from '@scure/bip32'
import { randomBytes } from '@noble/hashes/utils';
import './App.css'
import { LnpassId, lnpassIdToSeed, seedToLnpassId, toLnpassIdOrThrow } from './utils/lnpassId';

interface AccountCardProps {
  account: HDKey
}
function AccountCard({ account }: AccountCardProps) {
  return (<Card>
    <pre>
      {JSON.stringify(account, null, 2)}
    </pre>

    <div className="w-1/4">
      <Button
        gradientDuoTone="purpleToBlue"
        size="xl"
        onClick={() => (null)}
      >
        Login
      </Button>
    </div>
  </Card>)
}


interface IndexProps {
  lnpassId?: LnpassId
  logout: () => void
}
function Index({ lnpassId, logout }: IndexProps) {
  if (!lnpassId) {
    return <Navigate to="/login" replace={true} />
  } else {
    return <Main lnpassId={lnpassId} logout={logout} />
  }
}
interface MainProps {
  lnpassId: LnpassId
  logout: () => void
}
function Main({ lnpassId, logout }: MainProps) {
  const seed = useMemo(() => lnpassIdToSeed(lnpassId), [lnpassId])
  const hdkey = useMemo(() => HDKey.fromMasterSeed(seed), [seed])

  const accounts = [hdkey.derive(`m/0/2147483647'/1`)]

  return (<div className="p-2">
      <Tooltip content="Forget seed and logout!">
        <Button
          outline={true}
          gradientDuoTone="purpleToBlue"
          size="xl"
          onClick={() => logout()}
        >
          Logout
        </Button>
      </Tooltip>
      <div className="text-lg">
        { lnpassId }
      </div>

      {accounts.map((it) => (<div key={it.fingerprint}>
        <AccountCard account={it} />
      </div>))}
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
    } catch(e) {
      console.error(e)
    }
  }

  return (
    <div className="flex h-screen justify-center items-center text-3xl">
      <div className="w-full max-w-7xl">
        <Card>
          <div className="flex justify-center">
            Welcome
          </div>
          <div>
            <div className="hidden">
              <Label
                htmlFor="lnpass1"
                value="lnpass1"
              />
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
                    <div className="text-xl">&gt;</div>
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
              <Button
                outline={true}
                gradientDuoTone="purpleToBlue"
                size="xl"
                onClick={() => onNewButtonClicked()}
              >
                <div className="text-xl">New</div>
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
        element={<div>
          <Outlet />
        </div>}
      >
        <Route id="home" path="/" index element={<Index lnpassId={lnpassId} logout={() => {
            setLnpassId(undefined)
          }} />}
        />
        <Route id="login" path="/login" index element={lnpassId ? <Navigate to="/" replace={true} /> : <Login onSubmit={(lnpassId) => {
            setLnpassId(lnpassId)
          }}/>}
        />
        <Route id="404" path="*" element={<Navigate to="/" replace={true} />} />
      </Route>
    )
  )

  return <RouterProvider router={router} />
}


export default App
