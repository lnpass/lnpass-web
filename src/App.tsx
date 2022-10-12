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
import './App.css'

interface MainProps {
  seed?: string
  logout: () => void
}
function Main({ seed, logout }: MainProps) {
  if (!seed) {
    return <Navigate to="/login" replace={true} />
  }

  return (<>
      <div className="text-3xl">
        { seed }
      </div>

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
    </>
  )
}

interface LoginProps {
  onSubmit: (seed: string) => void
}
function Login({ onSubmit }: LoginProps) {
  const [seedInput, setSeedInput] = useState('')

  return (
    <div className="text-3xl">
      <Card>
        <div className="mb-2 block">
          Welcome
        </div>
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
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
            />
          </div>
          <div className="flex-none h-full">
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
      </Card>
    </div>
  )
}

function App() {
  const [seed, setSeed] = useState<string>()

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        id="base"
        element={<div className="p-2">
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
