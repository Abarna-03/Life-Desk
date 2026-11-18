import React from 'react'
import { Plus, Search, X, Clock, Wrench } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Electronics', 'Home Appliances', 'Vehicles', 'Home Hardware', 'Furniture']
const ROOMS = ['Living Room', 'Kitchen', 'Home Office', 'Garage', 'Utility Room']

const topBarStyles = {
  gold: 'bg-amber-100 text-amber-800 border-b border-amber-200',
  green: 'bg-emerald-100 text-emerald-800 border-b border-emerald-200',
  gray: 'bg-muted text-muted-foreground border-b border-border',
}

export default function Assets({
  assets,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  roomFilter,
  setRoomFilter,
  setSelectedAsset,
  setActiveTab,
  setShowAddAssetModal,
  setNewRepair,
  setShowAddRepairModal,
}) {
  const filteredAssets = assets.filter((a) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      searchQuery === '' ||
      a.name.toLowerCase().includes(q) ||
      (a.brand && a.brand.toLowerCase().includes(q)) ||
      (a.serial_number && a.serial_number.toLowerCase().includes(q))
    const matchesCat = categoryFilter === 'All' || a.category === categoryFilter
    const matchesRoom = roomFilter === 'All' || a.location_room === roomFilter
    return matchesSearch && matchesCat && matchesRoom
  })

  const hasFilters = searchQuery || categoryFilter !== 'All' || roomFilter !== 'All'

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">
            My Assets
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage physical appliances, electronics, vehicles, and furniture with warranty tracking.
          </p>
        </div>
        <Button type="button" onClick={() => setShowAddAssetModal(true)}>
          <Plus size={16} /> Register New Asset
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex min-w-[250px] flex-1 items-center gap-2">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Find by name, serial number, brand, vendor, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger size="sm" className="w-auto min-w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={roomFilter} onValueChange={setRoomFilter}>
          <SelectTrigger size="sm" className="w-auto min-w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Rooms</SelectItem>
            {ROOMS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setCategoryFilter('All')
              setRoomFilter('All')
            }}
          >
            <X size={14} /> Clear
          </Button>
        )}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="mb-4 text-muted-foreground">No assets found matching your search.</p>
            <Button type="button" onClick={() => setShowAddAssetModal(true)}>
              <Plus size={14} /> Add First Asset
            </Button>
          </div>
        ) : (
          filteredAssets.map((asset) => {
            const isExpiringSoon =
              asset.warranty_expiry_date &&
              new Date(asset.warranty_expiry_date) > new Date() &&
              new Date(asset.warranty_expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            const isExpired =
              asset.warranty_expiry_date && new Date(asset.warranty_expiry_date) < new Date()
            const tone = isExpiringSoon ? 'gold' : isExpired ? 'gray' : 'green'

            return (
              <Card
                key={asset.id}
                className="justify-between gap-0 overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div
                  className={cn(
                    'flex items-center justify-between px-5 py-3 text-[0.8125rem] font-bold',
                    topBarStyles[tone],
                  )}
                >
                  <span>{asset.name}</span>
                  <Badge variant="success">{asset.category}</Badge>
                </div>

                <div className="flex-1 p-5">
                  <div className="mb-4 grid grid-cols-2 gap-2 text-[0.85rem]">
                    <div><strong>Brand:</strong> {asset.brand || 'N/A'}</div>
                    <div><strong>Room:</strong> {asset.location_room || 'N/A'}</div>
                    <div><strong>Model:</strong> {asset.model_number || 'N/A'}</div>
                    <div><strong>Serial:</strong> {asset.serial_number || 'N/A'}</div>
                    <div><strong>Vendor:</strong> {asset.store_vendor || 'N/A'}</div>
                    <div><strong>Purchased:</strong> {asset.purchase_date || 'N/A'}</div>
                  </div>

                  <div className="mb-3 text-[1.35rem] font-extrabold text-primary">
                    ${Number(asset.purchase_price).toLocaleString()}
                  </div>

                  <div
                    className={cn(
                      'rounded-lg border border-border bg-muted px-3 py-2 text-[0.8125rem]',
                      isExpiringSoon ? 'text-amber-700' : 'text-stone-600',
                    )}
                  >
                    <strong>Warranty Status:</strong>{' '}
                    {isExpiringSoon
                      ? '⚠️ Expiring in 7 days!'
                      : isExpired
                        ? 'Expired'
                        : `Valid until ${asset.warranty_expiry_date}`}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border bg-stone-50 px-5 py-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedAsset(asset)
                      setActiveTab('timeline')
                    }}
                  >
                    <Clock size={14} /> Timeline
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setNewRepair((prev) => ({ ...prev, asset_id: asset.id }))
                      setShowAddRepairModal(true)
                    }}
                  >
                    <Wrench size={13} /> Report Issue
                  </Button>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
