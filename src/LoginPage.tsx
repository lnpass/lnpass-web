import { useEffect, useState } from 'react'
import { Button, Card, Label, TextInput, Tooltip } from 'flowbite-react'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
import { randomBytes } from '@noble/hashes/utils'
import { LnpassId, seedToLnpassId, toLnpassIdOrThrow } from './utils/lnpassId'
import { useLocation } from 'react-router-dom'

interface LoginPageProps {
  onSubmit: (id: LnpassId) => void
}

export function LoginPage({ onSubmit }: LoginPageProps) {
  const [lnpassIdInput, setLnpassIdInput] = useState('')
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return

    try {
      const hashValue = location.hash.substring(1)
      const lnpassId = toLnpassIdOrThrow(hashValue)
      onSubmit(lnpassId)
    } catch (e) {
      console.debug(`Could parse url hash as lnpassId`)
    }
  }, [location, onSubmit])

  const onNewButtonClicked = () => {
    const random = randomBytes(64)
    const lnpassId = seedToLnpassId(random)
    setLnpassIdInput(lnpassId)
    setTimeout(() => {
      onSubmit(lnpassId)
    }, 4)
  }

  const onSubmitButtonClicked = () => {
    try {
      onSubmit(toLnpassIdOrThrow(lnpassIdInput))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex h-screen justify-center items-center text-3xl">
      <div className="flex-1 max-w-7xl m-2">
        <Card>
          <div className="flex justify-center">Welcome</div>
          <div>
            <div className="hidden">
              <Label htmlFor="lnpass1" value="lnpass1" />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <div className="flex-1">
                <TextInput
                  id="lnpass1"
                  type="text"
                  sizing="lg"
                  placeholder="lnpass1..."
                  value={lnpassIdInput}
                  onChange={(e) => setLnpassIdInput(e.target.value)}
                />
              </div>
              <div className="flex-none">
                <Tooltip content="Let's go!">
                  <Button
                    outline={true}
                    gradientDuoTone="purpleToBlue"
                    size="xl"
                    onClick={() => onSubmitButtonClicked()}
                  >
                    <ArrowRightIcon className="h-6 w-6" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="text-sm">... or create new ...</div>
          </div>
          <div className="flex justify-center">
            <Tooltip content="Create a new identity pool!">
              <Button outline={true} gradientDuoTone="purpleToBlue" size="xl" onClick={() => onNewButtonClicked()}>
                <div className="text-xl">Create</div>
              </Button>
            </Tooltip>
          </div>
        </Card>
      </div>
    </div>
  )
}
