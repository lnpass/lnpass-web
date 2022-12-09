import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Button, Label, Modal, ModalProps, Textarea } from 'flowbite-react'
import { CheckCircleIcon, XCircleIcon, QrCodeIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { buildLnurlAuthUrl, decodeLnurlAuthRequest } from './utils/lnurlAuth'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5QrcodeScanType } from 'html5-qrcode'

type ActionEnum = 'register' | 'login' | 'link' | 'auth' | null

interface LnurlAuthRequestManualInputProps {
  onChange: (url: string) => void
}

function LnurlAuthRequestManualInput({ onChange }: LnurlAuthRequestManualInputProps) {
  const [lnurlAuthRequestInput, setLnurlAuthRequestInput] = useState('')

  return (
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
        onChange={(e) => {
          setLnurlAuthRequestInput(e.target.value)
          onChange(e.target.value)
        }}
      />
    </div>
  )
}

const QR_CODE_SCANNER_CONFIG = {
  formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
  fps: 2,
  qrbox: { width: 250, height: 250 },
  rememberLastUsedCamera: false,
  supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
}

interface LnurlAuthRequestCameraInputProps {
  onChange: (url: string) => void
  onError: (e: Error) => void
}

function LnurlAuthRequestCameraInput({ onChange, onError }: LnurlAuthRequestCameraInputProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tryMountCounter, setTryMountCounter] = useState<number>(0)

  useEffect(() => {
    if (containerRef.current === null) return
    if (tryMountCounter > 3) return

    try {
      const html5QrcodeScanner = new Html5QrcodeScanner(containerRef.current.id, QR_CODE_SCANNER_CONFIG, false)
      html5QrcodeScanner.render(
        (decodedText: string) => {
          onChange(decodedText)
        },
        (errorMessage: string) => {
          onError(new Error(errorMessage || 'Unknown error'))
        }
      )

      setTryMountCounter(0)
      return () => {
        html5QrcodeScanner.clear()
      }
    } catch (e) {
      setTryMountCounter((current) => current + 1)
      console.error(e)
    }
  }, [containerRef, tryMountCounter, onChange, onError])

  return (
    <div className="flex flex-col">
      <div ref={containerRef} id="reader"></div>
    </div>
  )
}

enum InputMode {
  QRCODE = 0,
  TEXT = 1,
}

interface LightningLoginModalProps extends ModalProps {
  account: Account
  onClose: () => void
}

export function LightningLoginModal({ account, show, onClose }: LightningLoginModalProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [inputMode, setInputMode] = useState(InputMode.QRCODE)
  const [lnurlAuthRequestInput, setLnurlAuthRequestInput] = useState('')
  const [inputError, setInputError] = useState<Error | undefined>()

  const url = useMemo(() => {
    setInputError(undefined)
    if (!lnurlAuthRequestInput) return

    try {
      return new URL(decodeLnurlAuthRequest(lnurlAuthRequestInput))
    } catch (e) {
      setInputError(e instanceof Error ? e : new Error('Could not decode input: Unkown Error'))
      return
    }
  }, [lnurlAuthRequestInput])

  const urlInfo = useMemo(() => {
    if (!url) return
    return {
      action: (url.searchParams.get('action') as ActionEnum) || undefined,
      protocol: url.protocol.replace(':', ''),
      port:
        url.port || (url.protocol === 'http:' ? '80' : undefined) || (url.protocol === 'https:' ? '443' : undefined),
    }
  }, [url])

  const authUrl = useMemo(() => {
    if (!url) return
    try {
      return buildLnurlAuthUrl(account.hdKey, url)
    } catch (e) {
      console.error('Could not build auth url: ' + e || 'Unknown error')
      return
    }
  }, [account.hdKey, url])

  useEffect(() => {
    if (!show) {
      setLnurlAuthRequestInput('')
    }
  }, [show])

  if (!show) {
    return <></>
  }

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Login with {account.name}</Modal.Header>
      <Modal.Body>
        <>
          <div className="mb-4 flex justify-center">
            <Button.Group>
              <Button size="sm" color="gray" onClick={() => setInputMode(InputMode.QRCODE)}>
                <QrCodeIcon className="w-6 h-6" />
              </Button>
              <Button size="sm" color="gray" onClick={() => setInputMode(InputMode.TEXT)}>
                <PencilIcon className="w-6 h-6" />
              </Button>
            </Button.Group>
          </div>
          {inputMode === InputMode.QRCODE && (
            <>
              {!authUrl ? (
                <>
                  <LnurlAuthRequestCameraInput
                    onChange={(val) => setLnurlAuthRequestInput(val)}
                    onError={(e) => null}
                  />
                </>
              ) : (
                <div className="flex flex-none">
                  <Button size="sm" color="gray" onClick={() => setLnurlAuthRequestInput('')}>
                    <ArrowPathIcon className="w-6 h-6 mr-3" />
                    Scan again
                  </Button>
                </div>
              )}
            </>
          )}
          {inputMode === InputMode.TEXT && (
            <>
              <LnurlAuthRequestManualInput onChange={(val) => setLnurlAuthRequestInput(val)} />
            </>
          )}
          {inputError && (
            <>
              <div className="mt-4 flex items-center gap-2">
                <XCircleIcon className="min-w-[10%] h-8 w-8 text-red-500 " />
                <div className="text-red-500 break-all">{inputError.message}</div>
              </div>
            </>
          )}
          {url && (
            <>
              <div className="mt-4 flex items-center gap-2">
                <CheckCircleIcon className="min-w-[10%] h-8 w-8 text-green-500" />
                <div className="text-2xl break-all">{url.hostname}</div>
              </div>
              {urlInfo && (
                <div className="mt-2 text-gray-500 flex items-center gap-2">
                  {urlInfo.action && <Badge color="info">Action: {urlInfo.action}</Badge>}
                  {urlInfo.protocol && <Badge color="gray">Protocol: {urlInfo.protocol}</Badge>}
                  {urlInfo.port && <Badge color="gray">Port: {urlInfo.port}</Badge>}
                </div>
              )}
            </>
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
              <Button
                gradientDuoTone="purpleToBlue"
                onClick={() => {
                  linkRef.current?.click()
                  onClose()
                }}
              >
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
