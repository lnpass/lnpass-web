
import { ProviderProps, createContext, useContext } from 'react'
import * as nostrTools from 'nostr-tools'

interface NostrToolsContextEntry {
 nostrTools: any
}

const NostrToolsContext = createContext<NostrToolsContextEntry | undefined>(undefined)

const NostrToolsProvider = ({ children }: ProviderProps<{}>) => {
  return (
    <NostrToolsContext.Provider value={{ nostrTools }}>
      <>{children}</>
    </NostrToolsContext.Provider>
  )
}

const useNostrToolsContext = () => {
  const context = useContext(NostrToolsContext)
  if (context === undefined) {
    throw new Error('useNostrToolsContext must be used within a NostrToolsProvider')
  }
  return context
}

export { NostrToolsContext, NostrToolsProvider, useNostrToolsContext }
