import { Button, Modal, ModalProps } from 'flowbite-react'

interface InfoModalProps extends ModalProps {
  title: string
}

export function InfoModal({ title, show, onClose, children, ...props }: InfoModalProps) {
  if (!show) {
    return <></>
  }

  return (
    <Modal show={show} onClose={onClose} {...props}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer className="flex justify-between">
        <Button className="w-full" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
