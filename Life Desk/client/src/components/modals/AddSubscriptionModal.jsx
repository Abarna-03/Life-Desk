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

const CATEGORIES = [
  { value: 'Insurance', label: 'Insurance' },
  { value: 'AMC', label: 'AMC (Maintenance Contract)' },
  { value: 'Utility', label: 'Utility' },
  { value: 'Software', label: 'Software / Cloud' },
]
const CYCLES = ['Monthly', 'Quarterly', 'Annually']

export default function AddSubscriptionModal({
  isOpen,
  onClose,
  newSub,
  setNewSub,
  assets,
  onSubmit,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a subscription</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sub-name">Contract / Service Name *</Label>
            <Input
              id="sub-name"
              placeholder="e.g. Car Comprehensive Insurance"
              required
              value={newSub.name}
              onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select
                value={newSub.category}
                onValueChange={(v) => setNewSub({ ...newSub, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Link to Asset</Label>
              <Select
                value={newSub.asset_id || 'none'}
                onValueChange={(v) => setNewSub({ ...newSub, asset_id: v === 'none' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Home Wide)</SelectItem>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sub-cost">Cost (₹) *</Label>
              <Input
                id="sub-cost"
                type="number"
                placeholder="450"
                required
                value={newSub.cost}
                onChange={(e) => setNewSub({ ...newSub, cost: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Billing Cycle *</Label>
              <Select
                value={newSub.billing_cycle}
                onValueChange={(v) => setNewSub({ ...newSub, billing_cycle: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CYCLES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sub-renewal">Next Renewal Date *</Label>
            <Input
              id="sub-renewal"
              type="date"
              required
              value={newSub.next_renewal_date}
              onChange={(e) => setNewSub({ ...newSub, next_renewal_date: e.target.value })}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Subscription</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
