import { useState } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
  Outlet,
} from 'react-router-dom'
import ROUTES from './routes'
import { LnpassId } from './utils/lnpassId'
import { LoginPage } from './LoginPage'
import { IdentitiesPage } from './IdentitiesPage'
import { ExportPage } from './ExportPage'
import { Sidebar } from './Sidebar'
import './App.css'

interface IndexProps {
  lnpassId?: LnpassId
}

function Index({ lnpassId }: IndexProps) {
  if (!lnpassId) {
    return <Navigate to={ROUTES.login} replace={true} />
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

              <div className="w-full p-2">
                <Outlet />
              </div>
            </div>
          }
        >
          <Route id="home" path={ROUTES.home} index element={<Index lnpassId={lnpassId} />} />
          {lnpassId && (
            <>
              <Route id="export" path={ROUTES.export} element={<ExportPage lnpassId={lnpassId} />} />
            </>
          )}
        </Route>
        <Route
          id="login"
          path={ROUTES.login}
          index
          element={
            lnpassId ? (
              <Navigate to={ROUTES.home} replace={true} />
            ) : (
              <LoginPage
                onSubmit={(lnpassId) => {
                  setLnpassId(lnpassId)
                }}
              />
            )
          }
        />
        <Route id="404" path="*" element={<Navigate to={ROUTES['*']} replace={true} />} />
      </Route>
    )
  )

  return <RouterProvider router={router} />
}

export default App
