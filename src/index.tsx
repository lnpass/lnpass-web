import ReactDOM from 'react-dom/client'
import App from './App'
import { NostrStorageProvider } from './contexts/NostrStorageContext'
import { SettingsProvider } from './contexts/SettingsContext'
import './index.css'

declare global {
  interface AppGlobal {
    APP_NAME: string
    SETTINGS_STORE_KEY: string
  }

  interface Window {
    APP: AppGlobal
  }
}

const defaultAppSettings = {
  dev: process.env.NODE_ENV === 'development',
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <>
    <NostrStorageProvider value={{}}>
      <SettingsProvider value={{ defaultValues: defaultAppSettings }}>
        <App />
      </SettingsProvider>
    </NostrStorageProvider>
  </>
)
