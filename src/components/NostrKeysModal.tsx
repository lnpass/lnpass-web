import { useMemo, useState } from 'react'
import { Label, ModalProps, TextInput, ToggleSwitch } from 'flowbite-react'
import { deriveNostrPrivateKey, deriveNostrPublicKey } from '../utils/nostr'
import { InfoModal } from './InfoModal'

interface NostrKeysModalProps extends ModalProps {
  account: Account
}

export function NostrKeysModal({ account, show, onClose, children, ...props }: NostrKeysModalProps) {
  const [showAsHex, setShowAsHex] = useState(false)

  const nostrPublicKey = useMemo(() => {
    if (account.hdKey.publicKey === null) return
    return deriveNostrPublicKey(account.hdKey)
  }, [account])

  const nostrPrivateKey = useMemo(() => {
    if (account.hdKey.privateKey === null) return
    return deriveNostrPrivateKey(account.hdKey)
  }, [account])

  if (!show) {
    return <></>
  }

  return (
    <InfoModal title="Nostr Keys" show={show} onClose={onClose} {...props}>
      <div className="flex flex-col gap-4 mb-8">
        {nostrPublicKey && (
          <div className="flex flex-col gap-2">
            {showAsHex ? (
              <>
                <div className="block">
                  <Label htmlFor="pubkeyHex" value="Public Key (hex)" className="font-bold" />
                </div>
                <TextInput
                  id="pubkeyHex"
                  placeholder="0x..."
                  readOnly={true}
                  addon="npub1"
                  value={nostrPublicKey.hex}
                />
              </>
            ) : (
              <>
                <div className="block">
                  <Label htmlFor="pubkey" value="Public Key" className="font-bold" />
                </div>
                <TextInput
                  id="pubkey"
                  placeholder="npub1..."
                  readOnly={true}
                  addon="npub1"
                  value={nostrPublicKey.nip19}
                />
              </>
            )}
          </div>
        )}
        {nostrPrivateKey && (
          <div className="flex flex-col gap-2">
            {showAsHex ? (
              <>
                <div className="block">
                  <Label htmlFor="privkeyHex" value="Private Key (hex)" className="font-bold" />
                </div>
                <TextInput
                  id="privkeyHex"
                  placeholder="0x..."
                  readOnly={true}
                  addon="nsec1"
                  value={nostrPrivateKey.hex}
                />
              </>
            ) : (
              <>
                <div className="block">
                  <Label htmlFor="privkey" value="Private Key" className="font-bold" />
                </div>
                <TextInput
                  id="privkey"
                  placeholder="nsec1..."
                  readOnly={true}
                  addon="nsec1"
                  value={nostrPrivateKey.nip19}
                />
              </>
            )}
          </div>
        )}
      </div>
      <div>
        <ToggleSwitch checked={showAsHex} label="Show as hex" onChange={() => setShowAsHex((current) => !current)} />
      </div>
    </InfoModal>
  )
}
