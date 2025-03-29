import { useMemo } from 'react'
import { Button, Card } from 'flowbite-react'
import { PencilSquareIcon, BoltIcon, KeyIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'

import { LnpassId, seedToLnpassId } from '../utils/lnpassId'
import { lnpassAccountDerivationPath } from '../utils/lnpass'
import { deriveEntropy } from '../utils/bip85'

interface AccountCardProps {
  account: Account
  edit: (account: Account) => void
  generateLoginHref?: (LnpassId: LnpassId) => string
  onClickLightning?: (account: Account) => void
  onClickNostr?: (account: Account) => void
}

export function AccountCard({ account, edit, generateLoginHref, onClickLightning, onClickNostr }: AccountCardProps) {
  const subLnpassId = useMemo(() => {
    // just derive an lnpass id from the first "lnpass account" of this account
    const entropy = deriveEntropy(account.hdKey, lnpassAccountDerivationPath(0))
    return seedToLnpassId(entropy)
  }, [account])

  const subLnpassLoginHref = useMemo(() => {
    if (!generateLoginHref) return
    return generateLoginHref(subLnpassId)
  }, [generateLoginHref, subLnpassId])

  return (
    <Card>
      <div className="flex flex-row items-center">
        <h6 className="text-xl font-bold tracking-tighter">{account.name}</h6>
        <div className="flex flex-wrap ml-3">
          <Button color="light" size="xs" outline={true} onClick={() => edit(account)}>
            <PencilSquareIcon className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      </div>
      <div className="hidden">
        <div className="text-xs text-slate-500">{account.path}</div>
      </div>
      <div className="">
        <div className="text-slate-500">{account.description}</div>
      </div>

      <div className="flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          {onClickLightning && (
            <Button gradientDuoTone="tealToLime" outline={true} onClick={() => onClickLightning(account)}>
              <div className="flex justify-center items-center gap-2">
                <BoltIcon className="h-6 w-6" />
                Login with Lightning
              </div>
            </Button>
          )}
          {onClickNostr && (
            <Button gradientDuoTone="cyanToBlue" outline={true} onClick={() => onClickNostr(account)}>
              <div className="flex justify-center items-center gap-2">
                <KeyIcon className="h-6 w-6 mr-3" />
                Nostr Keys
              </div>
            </Button>
          )}
        </div>
        {subLnpassLoginHref && (
          <div className="flex gap-2">
            <a href={subLnpassLoginHref} target="_blank" rel="noreferrer">
              <Button size="xs" gradientDuoTone="pinkToOrange" outline={true}>
                <div className="flex justify-center items-center gap-2">
                  <ArrowTopRightOnSquareIcon className="h-6 w-6 mr-3" />
                  lnpass
                </div>
              </Button>
            </a>
          </div>
        )}
      </div>
    </Card>
  )
}
