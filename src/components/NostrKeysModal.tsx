import { Label, ModalProps, TextInput } from 'flowbite-react'
import { useMemo } from 'react'
import { toNostrPrivateKey, toNostrPublicKey } from '../utils/nostr'
import { InfoModal } from './InfoModal'

interface NostrKeysModalProps extends ModalProps {
  account: Account
}

export function NostrKeysModal({ account, show, onClose, children, ...props }: NostrKeysModalProps) {
  const nostrPublicKey = useMemo(() => {
    if (account.hdKey.publicKey === null) return
    return toNostrPublicKey(account.hdKey.publicKey)
  }, [account])

  const nostrPrivateKey = useMemo(() => {
    if (account.hdKey.privateKey === null) return
    return toNostrPrivateKey(account.hdKey.privateKey)
  }, [account])

  if (!show) {
    return <></>
  }

  return (
    <InfoModal title="Nostr Keys" show={show} onClose={onClose} {...props}>
      <div className="flex flex-col gap-4">
        {nostrPublicKey && (
          <div>
            <div className="mb-2 block">
              <Label htmlFor="pubkey" value="Public Key" className="font-bold" />
            </div>
            <TextInput
              id="pubkey"
              placeholder="npub1..."
              readOnly={true}
              value={nostrPublicKey || 'Public Key not available'}
            />
          </div>
        )}
        {nostrPrivateKey && (
          <div>
            <div className="mb-2 block font-bold">
              <Label htmlFor="privkey" value="Private Key" className="font-bold" />
            </div>
            <TextInput
              id="privkey"
              placeholder="nsec1..."
              readOnly={true}
              value={nostrPrivateKey || 'Private Key not available'}
            />
          </div>
        )}
      </div>
    </InfoModal>
  )
}
