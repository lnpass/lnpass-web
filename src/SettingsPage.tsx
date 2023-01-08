import { Checkbox, Label } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { useFetchSecureSettingsValues, useUpdateSecureSettingsValue } from './contexts/EncryptedSettingsContext'
import { AppSettings, useSettings, useSettingsDispatch } from './contexts/SettingsContext'

export function SettingsPage() {
  const settings = useSettings()
  const settingsDispatch = useSettingsDispatch()
  const fetchSecureSettingsValues = useFetchSecureSettingsValues()
  const updateSecureSettingsValue = useUpdateSecureSettingsValue()

  const [secureSettings, setSecureSettings] = useState<{ [key: string]: any } | undefined>(undefined)

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

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tighter">Settings</h2>
      <div className="text-lg">{/* TODO: add subtitle */}</div>

      <div className="mb-4 flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tighter">Nostr</h2>
        {secureSettings && (
          <>
            <div className="flex gap-2">
              <div className="flex h-5 items-center">
                <Checkbox
                  id="enable-nostr-backups-checkbox"
                  checked={secureSettings.nostrBackupsEnabled || false}
                  onChange={(event) => updateSecureSettingsValue('nostrBackupsEnabled', event.target.checked)}
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="enable-nostr-backups-checkbox">Enable backups</Label>
                <div className="text-gray-500 dark:text-gray-300">
                  <span className="text-xs font-normal">Displays an option to push encrypted backups to Nostr</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
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
              <span className="text-xs font-normal">Append helpful debug information to pages</span>
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
