import ReactDOM from 'react-dom/client'
import App from './App'
import { NostrStorageProvider } from './contexts/NostrStorageContext'
import { SettingsProvider } from './contexts/SettingsContext'
import './index.css'

declare global {
  interface AppGlobal {
    SETTINGS_STORE_KEY: string
    DEFAULT_SECURE_SETTINGS: { [key: string]: any }
  }

  interface Window {
    APP: AppGlobal
  }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <>
    <NostrStorageProvider value={{}}>
      <SettingsProvider value={{}}>
        <App />
      </SettingsProvider>
    </NostrStorageProvider>
  </>
)
