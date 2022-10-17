import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Label, Modal, ModalProps, Textarea } from 'flowbite-react'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { buildLnurlAuthUrl, decodeLnurlAuthRequest } from './utils/lnurlAuth'

type ActionEnum = 'register' | 'login' | 'link' | 'auth' | null

interface LightningLoginModalProps extends ModalProps {
  account: Account
}

export function LightningLoginModal({ account, show, onClose }: LightningLoginModalProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [lnurlAuthRequestInput, setLnurlAuthRequestInput] = useState('')

  const url = useMemo(() => {
    if (!lnurlAuthRequestInput) return null

    try {
      return new URL(decodeLnurlAuthRequest(lnurlAuthRequestInput))
    } catch (e) {
      return null
    }
  }, [lnurlAuthRequestInput])

  const action = useMemo<ActionEnum>(() => (url ? (url.searchParams.get('action') as ActionEnum) : null), [url])

  const authUrl = useMemo(() => {
    if (url === null) return null
    try {
      return buildLnurlAuthUrl(account.hdKey, url)
    } catch (e) {
      return null
    }
  }, [account.hdKey, url])

  useEffect(() => {
    if (!show) {
      setLnurlAuthRequestInput('')
    }
  }, [show])

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Login with {account.name}</Modal.Header>
      <Modal.Body>
        <>
          <div className="">
            <div className="hidden">
              <Label htmlFor="lnurlAuthRequest" value="lnurl-auth Request" />
            </div>
            <Textarea
              id="lnurlAuthRequest"
              placeholder="lightning:lnurl1..."
              required={true}
              rows={4}
              value={lnurlAuthRequestInput}
              onChange={(e) => setLnurlAuthRequestInput(e.target.value)}
            />
          </div>

          {url && (
            <div className="mt-4 text-2xl flex items-center gap-2">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              {url.hostname}
              {action && <>: {action}</>}
            </div>
          )}
        </>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex flex-col w-full">
          {!authUrl ? (
            <Button gradientDuoTone="purpleToBlue" disabled>
              Login
            </Button>
          ) : (
            <>
              <Button gradientDuoTone="purpleToBlue" onClick={() => linkRef.current?.click()}>
                Login to {authUrl.hostname}
              </Button>
              <a
                ref={linkRef}
                className="hidden"
                href={authUrl.toString()}
                target="_lnpassAuth"
                rel="noopener noreferrer"
              >
                Login to {authUrl.hostname}
              </a>
            </>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  )
}
