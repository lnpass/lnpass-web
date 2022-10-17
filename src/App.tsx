import { useMemo, useState } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
  Outlet,
} from 'react-router-dom'
import { LnpassId } from './utils/lnpassId'
import { IdentitiesPage } from './IdentitiesPage'
import { LoginPage } from './LoginPage'
import { Sidebar } from './Sidebar'
import './App.css'

interface IndexProps {
  lnpassId?: LnpassId
}

function Index({ lnpassId }: IndexProps) {
  if (!lnpassId) {
    return <Navigate to="/login" replace={true} />
  } else {
    return <IdentitiesPage lnpassId={lnpassId} />
  }
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
              <LoginPage
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
