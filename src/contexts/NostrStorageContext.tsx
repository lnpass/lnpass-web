import { ProviderProps, createContext, useContext, useCallback } from 'react'
import { relayInit, generatePrivateKey, getPublicKey, getEventHash, signEvent, Event, Sub, Filter } from 'nostr-tools'

export interface NostrStorageContextEntry {
  pullSingle: (host: string, filters: Filter[], signal: AbortSignal) => Promise<Event | null>
  pushSingle: (host: string, event: Event, signal: AbortSignal) => Promise<Event>
}

const NostrStorageContext = createContext<NostrStorageContextEntry | undefined>(undefined)

const NostrStorageProvider = ({ children }: ProviderProps<{}>) => {
  const pullSingle = useCallback((host: string, filters: Filter[], signal: AbortSignal) => {
    return new Promise<Event | null>(async (resolve, reject) => {
      const relay = relayInit(host)
      await relay.connect()

      let sub: Sub | null = null

      const intervalId = setInterval(() => {
        if (signal.aborted) {
          cleanUp(() => reject())
        }
      }, 100)

      let cleanUpCalled = false
      const cleanUp = async (cb: () => void) => {
        if (cleanUpCalled) return
        cleanUpCalled = true

        clearInterval(intervalId)
        sub && sub.unsub()
        await relay.close()
        cb()
      }

      relay.on('connect', () => {
        console.log(`connected to ${relay.url}`)
      })
      relay.on('error', () => {
        console.log(`failed to connect to ${relay.url}`)
        cleanUp(() => reject())
      })

      sub = relay.sub(filters)
      sub.on('event', (event: any) => {
        console.log('<- event:', event)
        cleanUp(() => resolve(event as Event))
      })
      sub.on('eose', () => {
        console.log('<- eose')
        cleanUp(() => resolve(null))
      })
    })
  }, [])

  const pushSingle = useCallback((host: string, event: Event, signal: AbortSignal) => {
    return new Promise<Event>(async (resolve, reject) => {
      const relay = relayInit(host)
      await relay.connect()

      const intervalId = setInterval(() => {
        if (signal.aborted) {
          cleanUp(() => reject())
        }
      }, 100)

      let cleanUpCalled = false
      const cleanUp = async (cb: () => void) => {
        if (cleanUpCalled) return
        cleanUpCalled = true
        clearInterval(intervalId)
        await relay.close()
        cb()
      }

      let pub = relay.publish(event)
      pub.on('ok', () => {
        cleanUp(() => resolve(event))
      })
      pub.on('failed', (reason: any) => {
        cleanUp(() => reject())
      })
    })
  }, [])

  return (
    <NostrStorageContext.Provider value={{ pullSingle, pushSingle }}>
      <>{children}</>
    </NostrStorageContext.Provider>
  )
}

const useNostrStorageContext = () => {
  const context = useContext(NostrStorageContext)
  if (context === undefined) {
    throw new Error('useNostrStorageContext must be used within a NostrStorageProvider')
  }
  return context
}

export { NostrStorageContext, NostrStorageProvider, useNostrStorageContext }
