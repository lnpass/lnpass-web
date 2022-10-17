import { useEffect, useState } from 'react'
import { Button, Modal, ModalProps, Label, Textarea, TextInput } from 'flowbite-react'

interface AccountEditInfo {
  name: string
  description?: string
}

interface AccountEditModalProps extends ModalProps {
  account: Account
  onSave: (update: AccountEditInfo) => void
}

export function AccountEditModal({ account, onSave, show, onClose }: AccountEditModalProps) {
  const [name, setName] = useState(account.name)
  const [description, setDescription] = useState(account.description || '')

  useEffect(() => {
    if (!show) {
      setName('')
      setDescription('')
    } else {
      setName(account.name)
      setDescription(account.description || '')
    }
  }, [show, account])

  if (!show) {
    return <></>
  }

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Edit {account.name}</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-4">
          <div className="">
            <div className="">
              <Label htmlFor="name" value="Name" />
            </div>
            <TextInput
              id="name"
              placeholder="Business, School, etc."
              required={true}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="">
            <div className="">
              <Label htmlFor="description" value="Description" />
            </div>
            <Textarea
              id="description"
              placeholder="Use this identity for business, school, etc."
              required={false}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() =>
            onSave({
              name,
              description,
            })
          }
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
