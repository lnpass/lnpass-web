import ReactDOM from 'react-dom/client'
import App, { APP } from './App'
import { NostrStorageProvider } from './contexts/NostrStorageContext'
import { SettingsProvider } from './contexts/SettingsContext'
import './index.css'

const defaultAppSettings = {
  dev: APP.DEV_MODE,
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
