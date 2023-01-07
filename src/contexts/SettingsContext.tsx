import { ProviderProps, createContext, useReducer, useEffect, useContext } from 'react'

const localStorageKey = () => window.APP.SETTINGS_STORE_KEY

// TODO: add {read: true, write: true} to relay
type Relay = string
export interface AppSettings {
  dev: boolean
  relays: Relay[]
  [key: string]: any
}

const initialSettings: AppSettings = {
  dev: process.env.NODE_ENV === 'development',
  relays: [],
}

interface AppSettingsEntry {
  settings: AppSettings
  dispatch: (value: AppSettings) => void
}

const SettingsContext = createContext<AppSettingsEntry | undefined>(undefined)

const settingsReducer = (oldSettings: AppSettings, action: AppSettings) => {
  const { ...newSettings } = action

  return {
    ...oldSettings,
    ...newSettings,
  }
}

const SettingsProvider = ({ children }: ProviderProps<{}>) => {
  const [settings, dispatch] = useReducer(
    settingsReducer,
    Object.assign({}, initialSettings, JSON.parse(window.localStorage.getItem(localStorageKey()) || '{}'))
  )

  useEffect(() => {
    window.localStorage.setItem(localStorageKey(), JSON.stringify(settings))
  }, [settings])

  return <SettingsContext.Provider value={{ settings, dispatch }}>{children}</SettingsContext.Provider>
}

const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context.settings
}

const useSettingsDispatch = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettingsDispatch must be used within a SettingsProvider')
  }
  return context.dispatch
}

export { SettingsProvider, useSettings, useSettingsDispatch }
