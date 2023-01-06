import { useCallback, useState } from 'react'
import { Flowbite, useTheme } from 'flowbite-react'
import {
  createHashRouter,
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouteObject,
  RouterProvider,
  Outlet,
} from 'react-router-dom'
import ROUTES from './routes'
import { LnpassId } from './utils/lnpassId'
import { LoginPage } from './LoginPage'
import { IdentitiesPage } from './IdentitiesPage'
import { Sidebar } from './Sidebar'

import './App.css'
import { MobileMenuBar } from './MobileMenuBar'
import { BackupPage } from './BackupPage'
import { AccountsProvider } from './contexts/AccountsContext'

/* Using HashRouter for GitHub Pages compatibility */
const USE_HASH_ROUTER = true

const createRouter = (routes: RouteObject[]) => (USE_HASH_ROUTER ? createHashRouter : createBrowserRouter)(routes)

interface IndexProps {
  lnpassId?: LnpassId
  generateLoginHref: (LnpassId: LnpassId) => string
}

function Index({ lnpassId, generateLoginHref }: IndexProps) {
  if (!lnpassId) {
    return <Navigate to={ROUTES.login} replace={true} />
  } else {
    return (
      <>
        <AccountsProvider value={{ lnpassId }}>
          <IdentitiesPage lnpassId={lnpassId} generateLoginHref={generateLoginHref} />
        </AccountsProvider>
      </>
    )
  }
}

function App() {
  const theme = useTheme().theme

  const [lnpassId, setLnpassId] = useState<LnpassId>()

  const generateLoginHref = useCallback(
    (lnpassId: LnpassId) =>
      `${window.location.protocol}//${window.location.host}${USE_HASH_ROUTER ? '/#' : ''}${ROUTES.login}#${lnpassId}`,
    []
  )

  const router = createRouter(
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
            <>
              <MobileMenuBar sidebarId="sidebar" />
              <div className="flex flex-row">
                <Sidebar
                  elementId="sidebar"
                  logout={() => {
                    setLnpassId(undefined)
                  }}
                />

                <div className="w-full p-2">
                  <Outlet />
                </div>
              </div>
            </>
          }
        >
          <Route
            id="home"
            path={ROUTES.home}
            index
            element={<Index lnpassId={lnpassId} generateLoginHref={generateLoginHref} />}
          />
          {lnpassId && (
            <>
              {/*<Route id="export" path={ROUTES.export} element={<ExportPage lnpassId={lnpassId} />} />*/}
              <Route
                id="backup"
                path={ROUTES.backup}
                element={
                  <>
                    <BackupPage lnpassId={lnpassId} generateLoginHref={generateLoginHref} />
                  </>
                }
              />
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

  return (
    <Flowbite
      theme={{
        theme: {
          ...theme,
          tooltip: {
            ...theme.tooltip,
            target: '',
          },
        },
        usePreferences: false,
      }}
    >
      <RouterProvider router={router} />
    </Flowbite>
  )
}

export default App
