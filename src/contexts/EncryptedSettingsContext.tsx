import { ProviderProps, createContext, useEffect, useContext, useMemo, useState, useCallback } from 'react'
import { LnpassId, lnpassIdToHDKey } from '../utils/lnpassId'
import { deriveNostrKeys } from '../utils/nostr'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'
import { nip04 } from 'nostr-tools'
import { AppSettings, useSettings, useSettingsDispatch } from './SettingsContext'

const toNostrKeys = (lnpassId: LnpassId) => {
  return deriveNostrKeys(lnpassIdToHDKey(lnpassId))
}

type SecureValues = { [key: string]: any }

interface EncryptedSettingsEntry {
  fetchValues: () => Promise<SecureValues>
  updateValue: (key: string, value: any) => Promise<void>
}

const EncryptedSettingsContext = createContext<EncryptedSettingsEntry | undefined>(undefined)

interface EncryptedSettingsProviderProps {
  lnpassId: LnpassId
  defaultValues: SecureValues
}

const EncryptedSettingsProvider = ({
  value: { lnpassId, defaultValues },
  children,
}: ProviderProps<EncryptedSettingsProviderProps>) => {
  const settings = useSettings()
  const settingsDispatch = useSettingsDispatch()

  const [nostrPublicKey, nostrPrivateKey] = useMemo(() => toNostrKeys(lnpassId), [lnpassId])
  const settingsPropName = useMemo(() => `lnpass_${bytesToHex(sha256(sha256(lnpassId))).substring(0, 16)}`, [lnpassId])

  const ecryptedSettings = useMemo<string | undefined>(() => settings[settingsPropName], [settings, settingsPropName])

  const [decryptedSettings, setDecryptedSettings] = useState<SecureValues | undefined>(undefined)

  const fetchAndDecryptEncryptedSettings = useCallback(async () => {
    if (!ecryptedSettings) {
      return defaultValues
    }

    return nip04
      .decrypt(nostrPrivateKey.hex, nostrPublicKey.hex, ecryptedSettings)
      .then((decrypted) => JSON.parse(decrypted) as SecureValues)
  }, [defaultValues, ecryptedSettings, nostrPrivateKey, nostrPublicKey])

  useEffect(() => {
    const abortCtrl = new AbortController()
    fetchAndDecryptEncryptedSettings().then((decrypted) => {
      if (abortCtrl.signal.aborted) return
      setDecryptedSettings(decrypted)
    })

    return () => {
      abortCtrl.abort()
    }
  }, [fetchAndDecryptEncryptedSettings])

  const updateValue = useCallback(
    async (key: string, value: any) => {
      if (decryptedSettings === undefined) {
        throw new Error('Illegal state: encrypted settings not ready yet.')
      }

      const updatedSettings = { ...decryptedSettings, [key]: value }
      return nip04.encrypt(nostrPrivateKey.hex, nostrPublicKey.hex, JSON.stringify(updatedSettings)).then((encrypted) =>
        settingsDispatch({
          [settingsPropName]: encrypted,
        } as AppSettings)
      )
    },
    [decryptedSettings, settingsDispatch, settingsPropName, nostrPrivateKey, nostrPublicKey]
  )

  return (
    <EncryptedSettingsContext.Provider value={{ fetchValues: fetchAndDecryptEncryptedSettings, updateValue }}>
      {children}
    </EncryptedSettingsContext.Provider>
  )
}

const useFetchSecureSettingsValues = () => {
  const context = useContext(EncryptedSettingsContext)
  if (context === undefined) {
    throw new Error('useEncryptedSettings must be used within a EncryptedSettingsProvider')
  }
  return context.fetchValues
}

const useUpdateSecureSettingsValue = () => {
  const context = useContext(EncryptedSettingsContext)
  if (context === undefined) {
    throw new Error('useEncryptedSettingsDispatch must be used within a EncryptedSettingsProvider')
  }
  return context.updateValue
}

export { EncryptedSettingsProvider, useFetchSecureSettingsValues, useUpdateSecureSettingsValue }
