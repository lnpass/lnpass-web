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
import { Sidebar } from './components/Sidebar'
import { MobileMenuBar } from './components/MobileMenuBar'
import { AccountsProvider } from './contexts/AccountsContext'
import { SecureSettingsProvider } from './contexts/SecureSettingsContext'
import { LoginPage } from './LoginPage'
import { IdentitiesPage } from './IdentitiesPage'
import { BackupPage } from './BackupPage'
import { SettingsPage } from './SettingsPage'

import './App.css'

const devMode = process.env.NODE_ENV === 'development' && process.env.REACT_APP_DEV_MODE === 'true'

const DEFAULT_SECURE_SETTINGS = {
  autoSyncNostrEnabled: false,
  relays: (() => {
    const developmentRelays = devMode
      ? [
          {
            url: 'ws://localhost:7000',
            read: true,
            write: true,
          },
          {
            url: 'wss://non-existing-nostr-relay.example.com:7000',
            read: false,
            write: true,
          },
        ]
      : []

    const enableProdRelays = !devMode
    const prodRelays = [
      {
        url: 'wss://nostr-pub.wellorder.net',
        read: enableProdRelays,
        write: enableProdRelays,
      },
      {
        url: 'wss://relay.nostr.info',
        read: false,
        write: enableProdRelays,
      },
      {
        url: 'wss://nostr.rocks',
        read: false,
        write: enableProdRelays,
      },
      {
        url: 'wss://nostr-relay.wlvs.space',
        read: false,
        write: enableProdRelays,
      },
      {
        url: 'wss://nostr-relay.untethr.me',
        read: false,
        write: enableProdRelays,
      },
    ]

    return [...developmentRelays, ...prodRelays]
  })(),
}

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
        <SecureSettingsProvider value={{ lnpassId, defaultValues: DEFAULT_SECURE_SETTINGS }}>
          <IdentitiesPage lnpassId={lnpassId} generateLoginHref={generateLoginHref} />
        </SecureSettingsProvider>
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

              <Route
                id="settings"
                path={ROUTES.settings}
                element={
                  <SecureSettingsProvider value={{ lnpassId, defaultValues: DEFAULT_SECURE_SETTINGS }}>
                    <SettingsPage />
                  </SecureSettingsProvider>
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
      <AccountsProvider value={{ lnpassId }}>
        <RouterProvider router={router} />
      </AccountsProvider>
    </Flowbite>
  )
}

export default App
