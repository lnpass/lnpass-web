import { Alert, Button, Checkbox, Label, Table, TextInput, ToggleSwitch } from 'flowbite-react'
import { useCallback, useEffect, useState } from 'react'
import { useFetchSecureSettingsValues, useUpdateSecureSettingsValue } from './contexts/EncryptedSettingsContext'
import { AppSettings, useSettings, useSettingsDispatch } from './contexts/SettingsContext'
import { InformationCircleIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

export function SettingsPage() {
  const settings = useSettings()
  const settingsDispatch = useSettingsDispatch()
  const fetchSecureSettingsValues = useFetchSecureSettingsValues()
  const updateSecureSettingsValue = useUpdateSecureSettingsValue()

  const [secureSettings, setSecureSettings] = useState<{ [key: string]: any } | undefined>(undefined)

  const [nostrRelayInput, setNostrRelayInput] = useState('')

  useEffect(() => {
    const abortCtrl = new AbortController()
    fetchSecureSettingsValues().then((val) => {
      if (abortCtrl.signal.aborted) return
      setSecureSettings(val)
    })

    return () => {
      abortCtrl.abort()
    }
  }, [fetchSecureSettingsValues])

  const toggleReadForRelay = useCallback(
    (relays: any[], relay: any) => {
      const changePrimaryReadRelay = relay.read !== true
      const enableRead = relay.read !== true

      updateSecureSettingsValue(
        'relays',
        relays.map((it: any) => {
          if (it.url !== relay.url) {
            if (!changePrimaryReadRelay) return it
            return { ...it, read: false }
          }
          return { ...it, write: enableRead ? true : it.write, read: !it.read }
        })
      )
    },
    [updateSecureSettingsValue]
  )

  const toggleWriteForRelay = useCallback(
    (relays: any[], relay: any) => {
      const disableWrite = relay.write === true
      updateSecureSettingsValue(
        'relays',
        relays.map((it: any) => {
          if (it.url !== relay.url) return it
          return { ...it, read: disableWrite ? false : it.read, write: !it.write }
        })
      )
    },
    [updateSecureSettingsValue]
  )

  const removeRelay = useCallback(
    (relays: any[], relay: any) => {
      updateSecureSettingsValue(
        'relays',
        relays.filter((it: any) => it.url !== relay.url)
      )
    },
    [updateSecureSettingsValue]
  )

  const addRelay = useCallback(
    (relays: any[], url: string) => {
      const urlValid = url.startsWith('ws://') || url.startsWith('wss://')
      if (!urlValid) {
        throw new Error('Illegal Argument: Url is not valid')
      }

      const newRelay = {
        url,
        read: true,
        write: relays.length === 0,
      }
      updateSecureSettingsValue('relays', [...relays.filter((it: any) => it.url !== url), newRelay])
    },
    [updateSecureSettingsValue]
  )

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tighter">Settings</h2>
      <div className="text-lg">{/* TODO: add subtitle */}</div>

      <div className="mb-4 flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tighter">Nostr</h2>
        {secureSettings && (
          <>
            {/*<div className="flex gap-2">
              <div className="flex h-5 items-center">
                <Checkbox
                  id="auto-sync-nostr-checkbox"
                  checked={secureSettings.autoSyncNostrEnabled || false}
                  onChange={(event) => updateSecureSettingsValue('autoSyncNostrEnabled', event.target.checked)}
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="auto-sync-nostr-checkbox">Enable Auto-Sync to Nostr</Label>
                <div className="text-gray-500 dark:text-gray-300">
                  <span className="text-xs font-normal">Automatically synchronize encrypted backups with Nostr</span>
                </div>
              </div>
            </div>*/}
            <Table>
              <Table.Head>
                <Table.HeadCell>Relay</Table.HeadCell>
                <Table.HeadCell>Read</Table.HeadCell>
                <Table.HeadCell>Write</Table.HeadCell>
                <Table.HeadCell>
                  <span className="sr-only">Delete Relay</span>
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {secureSettings.relays &&
                  secureSettings.relays.map((it: any, index: number) => {
                    return (
                      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={index}>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          {it.url}
                        </Table.Cell>
                        <Table.Cell>
                          <ToggleSwitch
                            label="read"
                            checked={it.read || false}
                            onChange={() => toggleReadForRelay(secureSettings.relays, it)}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <ToggleSwitch
                            label="write"
                            checked={it.write || false}
                            onChange={() => toggleWriteForRelay(secureSettings.relays, it)}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            className="border-1"
                            onClick={() => removeRelay(secureSettings.relays, it)}
                            pill={true}
                            outline={true}
                            size="xs"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
              </Table.Body>
            </Table>

            {secureSettings.relays && secureSettings.relays.length === 0 && (
              <>
                <Alert icon={InformationCircleIcon} color="info" rounded={false}>
                  <span>
                    <span className="font-medium">
                      No nostr relay configured. Add a new relay to sync and store backend securely.
                    </span>
                  </span>
                </Alert>
              </>
            )}

            <div>
              <div className="block">
                <Label htmlFor="relay-input" value="Add new relay" className="text-lg font-bold tracking-tighter" />
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="flex-1">
                  <TextInput
                    id="relay-input"
                    type="text"
                    placeholder="wss://nostr.example.com"
                    value={nostrRelayInput}
                    onChange={(e) => setNostrRelayInput(e.target.value)}
                  />
                </div>
                <div className="flex-none">
                  <Button
                    outline={true}
                    onClick={() => {
                      addRelay(secureSettings.relays, nostrRelayInput.trim())
                      setNostrRelayInput('')
                    }}
                    disabled={!(nostrRelayInput.startsWith('ws://') || nostrRelayInput.startsWith('wss://'))}
                  >
                    <PlusIcon className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tighter">Developer Settings</h2>
        <div className="flex gap-2">
          <div className="flex h-5 items-center">
            <Checkbox
              id="developer-mode-checkbox"
              checked={settings.dev}
              onChange={() => settingsDispatch({ dev: !settings.dev } as AppSettings)}
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="developer-mode-checkbox">Enable Developer Mode</Label>
            <div className="text-gray-500 dark:text-gray-300">
              <span className="text-xs font-normal">Append debug information to pages or console</span>
            </div>
          </div>
        </div>
      </div>

      {settings.dev && (
        <div className="mt-8">
          <h6 className="font-bold font-mono ">[debug]</h6>
          <h6 className="font-mono">settings</h6>
          <div className="mb-4">
            <pre>{`${JSON.stringify(settings, null, 2)}`}</pre>
          </div>
          <h6 className="font-mono">encrypted settings</h6>
          <div className="mb-4">
            <pre>{`${JSON.stringify(secureSettings, null, 2)}`}</pre>
          </div>
        </div>
      )}
    </>
  )
}
