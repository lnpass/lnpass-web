import ReactDOM from 'react-dom/client'
import App from './App'
import { NostrStorageProvider } from './contexts/NostrStorageContext'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <>
    <NostrStorageProvider value={{}}>
      <App />
    </NostrStorageProvider>
  </>
)
