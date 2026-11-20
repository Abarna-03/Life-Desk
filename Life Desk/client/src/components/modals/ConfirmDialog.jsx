import React from 'react'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle size={17} />
            </span>
            {title}
          </DialogTitle>
        </DialogHeader>

        {message && <p className="text-sm text-muted-foreground">{message}</p>}

        <DialogFooter className="mt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
