import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DOC_TYPES = [
  { value: 'Invoice', label: 'Invoice / Receipt' },
  { value: 'Warranty_Card', label: 'Warranty Card' },
  { value: 'Insurance_Policy', label: 'Insurance Policy' },
  { value: 'Manual', label: 'Manual / Certificate' },
  { value: 'Other', label: 'Other' },
]

export default function AddDocumentModal({
  isOpen,
  onClose,
  newDoc,
  setNewDoc,
  assets,
  onSubmit,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vault Document (LifeAdmin)</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-title">Document Title *</Label>
            <Input
              id="doc-title"
              placeholder="e.g. Tax Invoice, Gas Certificate"
              required
              value={newDoc.title}
              onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Document Type</Label>
              <Select
                value={newDoc.document_type}
                onValueChange={(v) => setNewDoc({ ...newDoc, document_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Link to Asset</Label>
              <Select
                value={newDoc.asset_id || 'none'}
                onValueChange={(v) => setNewDoc({ ...newDoc, asset_id: v === 'none' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General Document</SelectItem>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-expiry">Expiration Date (if applicable)</Label>
            <Input
              id="doc-expiry"
              type="date"
              value={newDoc.expiry_date}
              onChange={(e) => setNewDoc({ ...newDoc, expiry_date: e.target.value })}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Vault Document</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
