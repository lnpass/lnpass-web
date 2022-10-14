import { useState } from 'react'
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
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils';
import './App.css'

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

interface MainProps {
  seed?: string
  logout: () => void
}
function Main({ seed, logout }: MainProps) {
  if (!seed) {
    return <Navigate to="/login" replace={true} />
  }
  const seedTmp =
  'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542'
  const hdkey = HDKey.fromMasterSeed(hexToBytes(seedTmp))

  console.log(hdkey)

  console.log(hdkey.derive(`m/0/2147483647'/1`))

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
      <div className="text-3xl">
        { seed }
      </div>

      {accounts.map((it) => (<div key={it.fingerprint}>
        <AccountCard account={it} />
      </div>))}
    </div>
  )
}

interface LoginProps {
  onSubmit: (seed: string) => void
}
function Login({ onSubmit }: LoginProps) {
  const [seedInput, setSeedInput] = useState('')

  const onNewButtonClicked = () => {
    const random = randomBytes(64)
    const seed = bytesToHex(random)
    onSubmit(seed)
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
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                />
              </div>
              <div className="flex-none">
                <Tooltip content="Let's go!">
                  <Button
                    outline={true}
                    gradientDuoTone="purpleToBlue"
                    size="xl"
                    onClick={() => onSubmit(seedInput)}
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
  const [seed, setSeed] = useState<string>()

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        id="base"
        element={<div>
          <Outlet />
        </div>}
      >
        <Route id="home" path="/" index element={<Main seed={seed} logout={() => {
            setSeed(undefined)
          }} />}
        />
        <Route id="login" path="/login" index element={seed ? <Navigate to="/" replace={true} /> : <Login onSubmit={(seed) => {
            setSeed(seed)
          }}/>}
        />
        <Route id="404" path="*" element={<Navigate to="/" replace={true} />} />
      </Route>
    )
  )

  return <RouterProvider router={router} />
}


export default App
