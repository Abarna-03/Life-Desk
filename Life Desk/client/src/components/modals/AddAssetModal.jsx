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

const CATEGORIES = ['Electronics', 'Home Appliances', 'Vehicles', 'Home Hardware', 'Furniture']
const ROOMS = ['Living Room', 'Kitchen', 'Home Office', 'Garage', 'Utility Room']

export default function AddAssetModal({ isOpen, onClose, newAsset, setNewAsset, onSubmit }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an item</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-name">Asset / Product Name *</Label>
            <Input
              id="asset-name"
              placeholder="e.g. Sony Bravia 65-inch OLED TV"
              required
              value={newAsset.name}
              onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Category *</Label>
              <Select
                value={newAsset.category}
                onValueChange={(v) => setNewAsset({ ...newAsset, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Room / Location</Label>
              <Select
                value={newAsset.location_room}
                onValueChange={(v) => setNewAsset({ ...newAsset, location_room: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOMS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-brand">Brand</Label>
              <Input
                id="asset-brand"
                placeholder="Apple, LG, Bosch"
                value={newAsset.brand}
                onChange={(e) => setNewAsset({ ...newAsset, brand: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-model">Model Number</Label>
              <Input
                id="asset-model"
                placeholder="A2991"
                value={newAsset.model_number}
                onChange={(e) => setNewAsset({ ...newAsset, model_number: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-price">Purchase Price ($) *</Label>
              <Input
                id="asset-price"
                type="number"
                placeholder="1499"
                required
                value={newAsset.purchase_price}
                onChange={(e) => setNewAsset({ ...newAsset, purchase_price: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-date">Purchase Date</Label>
              <Input
                id="asset-date"
                type="date"
                value={newAsset.purchase_date}
                onChange={(e) => setNewAsset({ ...newAsset, purchase_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-vendor">Vendor / Store</Label>
              <Input
                id="asset-vendor"
                placeholder="Best Buy, Amazon"
                value={newAsset.store_vendor}
                onChange={(e) => setNewAsset({ ...newAsset, store_vendor: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-warranty">Warranty Expiry Date</Label>
              <Input
                id="asset-warranty"
                type="date"
                value={newAsset.warranty_expiry_date}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, warranty_expiry_date: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Asset to LifeHub</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
