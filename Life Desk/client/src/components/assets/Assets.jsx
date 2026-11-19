import React from 'react'
import { Plus, Search, X, Clock, Wrench } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CardFooterBar,
  CardsGrid,
  CardTopBar,
  EmptyState,
  EntityCard,
  SectionHeader,
} from '@/components/common'
import { formatMoney } from '@/utils/formatters'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Electronics', 'Home Appliances', 'Vehicles', 'Home Hardware', 'Furniture']
const ROOMS = ['Living Room', 'Kitchen', 'Home Office', 'Garage', 'Utility Room']

/* ---------- Search + category/room filter bar ---------- */
function AssetFilterBar({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  roomFilter,
  setRoomFilter,
  hasFilters,
  onClear,
}) {
  return (
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
        <Button type="button" variant="secondary" size="sm" onClick={onClear}>
          <X size={14} /> Clear
        </Button>
      )}
    </div>
  )
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
      <SectionHeader
        title="My Assets"
        subtitle="Manage physical appliances, electronics, vehicles, and furniture with warranty tracking."
        action={
          <Button type="button" onClick={() => setShowAddAssetModal(true)}>
            <Plus size={16} /> Register New Asset
          </Button>
        }
      />

      <AssetFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        roomFilter={roomFilter}
        setRoomFilter={setRoomFilter}
        hasFilters={hasFilters}
        onClear={() => {
          setSearchQuery('')
          setCategoryFilter('All')
          setRoomFilter('All')
        }}
      />

      {/* Assets Grid */}
      <CardsGrid>
        {filteredAssets.length === 0 ? (
          <EmptyState
            fullWidth
            message="No assets found matching your search."
            action={
              <Button type="button" onClick={() => setShowAddAssetModal(true)}>
                <Plus size={14} /> Add First Asset
              </Button>
            }
          />
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
              <EntityCard key={asset.id}>
                <CardTopBar tone={tone}>
                  <span>{asset.name}</span>
                  <Badge variant="success">{asset.category}</Badge>
                </CardTopBar>

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
                    {formatMoney(asset.purchase_price)}
                  </div>

                  <div
                    className={cn(
                      'rounded-lg border border-border bg-muted px-3 py-2 text-[0.8125rem]',
                      isExpiringSoon ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground',
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

                <CardFooterBar>
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
                </CardFooterBar>
              </EntityCard>
            )
          })
        )}
      </CardsGrid>
    </div>
  )
}
