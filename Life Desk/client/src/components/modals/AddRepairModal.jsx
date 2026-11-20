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

const SERVICE_TYPES = [
  { value: 'Repair', label: 'Repair' },
  { value: 'Preventive', label: 'Preventive Maintenance' },
  { value: 'Inspection', label: 'Inspection / Safety Check' },
]

const STATUSES = ['Reported', 'Scheduled', 'In Progress', 'Completed', 'Cancelled']

export default function AddRepairModal({
  isOpen,
  onClose,
  newRepair,
  setNewRepair,
  assets,
  onSubmit,
  isEdit = false,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Service / Repair' : 'Log Service / Repair'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label>Asset *</Label>
            <Select
              value={newRepair.asset_id || undefined}
              onValueChange={(v) => setNewRepair({ ...newRepair, asset_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Asset..." />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="repair-title">Issue Title *</Label>
            <Input
              id="repair-title"
              placeholder="e.g. Water leak / Brake pads worn out"
              required
              value={newRepair.title}
              onChange={(e) => setNewRepair({ ...newRepair, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Service Type</Label>
              <Select
                value={newRepair.service_type}
                onValueChange={(v) => setNewRepair({ ...newRepair, service_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="repair-date">Service Date</Label>
              <Input
                id="repair-date"
                type="date"
                value={newRepair.service_date}
                onChange={(e) => setNewRepair({ ...newRepair, service_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="repair-provider">Service Provider / Technician</Label>
            <Input
              id="repair-provider"
              placeholder="e.g. David Parker (BOXT Certified)"
              value={newRepair.service_provider_name}
              onChange={(e) =>
                setNewRepair({ ...newRepair, service_provider_name: e.target.value })
              }
            />
          </div>

          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select
                value={newRepair.status || 'Reported'}
                onValueChange={(v) => setNewRepair({ ...newRepair, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="repair-labor">Labor Cost (₹)</Label>
              <Input
                id="repair-labor"
                type="number"
                placeholder="50"
                value={newRepair.labor_cost}
                onChange={(e) => setNewRepair({ ...newRepair, labor_cost: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="repair-parts">Parts Cost (₹)</Label>
              <Input
                id="repair-parts"
                type="number"
                placeholder="40"
                value={newRepair.parts_cost}
                onChange={(e) => setNewRepair({ ...newRepair, parts_cost: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? 'Save Changes' : 'Record Service'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
