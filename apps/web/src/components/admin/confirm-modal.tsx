'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface ConfirmModalProps {
  isOpen: boolean
  onConfirm: () => Promise<void> | void
  onCancel: () => void
  title: string
  description: string
  confirmLabel?: string
  variant?: 'destructive' | 'default'
}

export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Delete',
  variant = 'destructive',
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} description={description} size="sm">
      <ModalContent>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 rounded-full bg-neon-pink/10">
            <AlertTriangle className="h-5 w-5 text-neon-pink" />
          </div>
          <p className="text-sm text-foreground-muted">{description}</p>
        </div>
      </ModalContent>
      <ModalFooter className="justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant={variant} onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {confirmLabel}...
            </>
          ) : (
            confirmLabel
          )}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
