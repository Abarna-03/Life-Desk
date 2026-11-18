import React from 'react'
import { Calendar, FileText, CreditCard, Wrench, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState, SectionHeader } from '@/components/common'
import { formatMoney } from '@/utils/formatters'
import { cn } from '@/lib/utils'

function TimelineItem({ dotColor, last, children }) {
  return (
    <div
      className={cn(
        'relative border-l-2 pb-8 pl-11',
        last ? 'border-transparent pb-0' : 'border-stone-200',
      )}
    >
      <span
        className="absolute -left-[0.6875rem] top-0.5 size-[1.35rem] rounded-full border-[3px] border-white"
        style={{ background: dotColor, boxShadow: `0 0 0 1px ${dotColor}` }}
      />
      {children}
    </div>
  )
}

const DOTS = {
  emerald: '#10b981',
  primary: '#4f46e5',
  purple: '#8b5cf6',
  danger: '#ef4444',
  amber: '#f59e0b',
}

/* ---------- Total-cost-of-ownership summary banner ---------- */
function TcoBanner({ asset, tco, repairSum, subsSum }) {
  const breakdown = [
    { label: 'Initial Purchase', val: Number(asset.purchase_price || 0) },
    { label: 'Repairs & Maintenance', val: repairSum },
    { label: 'AMCs & Protection', val: subsSum },
  ]
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-5 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 px-7 py-6 shadow-sm">
      <div>
        <div className="text-sm font-bold uppercase tracking-wide text-primary">
          Total Cost of Ownership
        </div>
        <div className="mt-1 text-4xl font-black tracking-tight text-indigo-900">
          {formatMoney(tco)}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {asset.name} ({asset.brand}) · Serial: {asset.serial_number || 'N/A'}
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        {breakdown.map((item) => (
          <div key={item.label} className="text-right">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              {item.label}
            </div>
            <div className="text-[1.125rem] font-bold text-foreground">
              {formatMoney(item.val)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Timeline({
  assets,
  selectedAsset,
  setSelectedAsset,
  subscriptions,
  repairs,
  documents,
}) {
  if (!selectedAsset) {
    return <EmptyState message="No asset selected or no assets registered yet." />
  }

  const assetRepairs = repairs.filter((r) => r.asset_id === selectedAsset.id)
  const assetSubs = subscriptions.filter((s) => s.asset_id === selectedAsset.id)
  const assetDocs = documents.filter((d) => d.asset_id === selectedAsset.id)

  const repairSum = assetRepairs.reduce(
    (sum, r) => sum + Number(r.total_cost || (Number(r.labor_cost || 0) + Number(r.parts_cost || 0))),
    0,
  )
  const subsSum = assetSubs.reduce((sum, s) => sum + Number(s.cost || 0), 0)
  const tco = Number(selectedAsset.purchase_price || 0) + repairSum + subsSum

  return (
    <div>
      <SectionHeader
        title="Timeline"
        subtitle={
          <>
            Full history and total cost of ownership for{' '}
            <strong>{selectedAsset.name}</strong>.
          </>
        }
        action={
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Switch Asset:</span>
            <Select
              value={selectedAsset.id}
              onValueChange={(v) => setSelectedAsset(assets.find((a) => a.id === v))}
            >
              <SelectTrigger size="sm" className="w-auto min-w-[160px]">
                <SelectValue />
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
        }
      />

      <TcoBanner
        asset={selectedAsset}
        tco={tco}
        repairSum={repairSum}
        subsSum={subsSum}
      />

      {/* Timeline Feed */}
      <div className="mx-auto max-w-[860px] rounded-xl border border-border bg-card p-8 shadow-sm">
        {/* 1. Purchase */}
        <TimelineItem dotColor={DOTS.emerald}>
          <div className="mb-1.5 flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
            <Calendar size={13} /> {selectedAsset.purchase_date || 'Purchase Date'} ·{' '}
            <Badge variant="success">Purchase Milestone</Badge>
          </div>
          <div className="mb-1.5 text-[1.05rem] font-bold text-foreground">
            Acquired &amp; Registered: {selectedAsset.name}
          </div>
          <div className="mb-2 text-sm text-muted-foreground">
            Purchased from {selectedAsset.store_vendor || 'Authorized Vendor'}. Initial capital expenditure.
          </div>
          <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-[0.8125rem] font-bold text-primary">
            + {formatMoney(selectedAsset.purchase_price || 0)}
          </span>
        </TimelineItem>

        {/* 2. Documents */}
        {assetDocs.map((doc, idx) => (
          <TimelineItem key={`doc-${idx}`} dotColor={DOTS.primary}>
            <div className="mb-1.5 flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
              <FileText size={13} /> Document Saved ·{' '}
              <Badge variant="info">{doc.document_type}</Badge>
            </div>
            <div className="mb-1.5 text-[1.05rem] font-bold text-foreground">{doc.title}</div>
            <div className="mb-2 text-sm text-muted-foreground">
              File: {doc.file_name} · Securely saved in Documents.
            </div>
            <span className="inline-block rounded-md bg-muted px-2.5 py-1 text-[0.8125rem] font-bold text-stone-600">
              Vault Record (No Cost)
            </span>
          </TimelineItem>
        ))}

        {/* 3. Subscriptions */}
        {assetSubs.map((sub, idx) => (
          <TimelineItem key={`sub-${idx}`} dotColor={DOTS.purple}>
            <div className="mb-1.5 flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
              <CreditCard size={13} /> Contract Milestone ·{' '}
              <Badge variant="purple">{sub.category}</Badge>
            </div>
            <div className="mb-1.5 text-[1.05rem] font-bold text-foreground">{sub.name}</div>
            <div className="mb-2 text-sm text-muted-foreground">
              Billing cadence: {sub.billing_cycle} · Next scheduled renewal: {sub.next_renewal_date}
            </div>
            <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-[0.8125rem] font-bold text-primary">
              + {formatMoney(sub.cost)} / {sub.billing_cycle.toLowerCase()}
            </span>
          </TimelineItem>
        ))}

        {/* 4. Repairs */}
        {assetRepairs.map((rep, idx) => (
          <TimelineItem key={`rep-${idx}`} dotColor={DOTS.danger}>
            <div className="mb-1.5 flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
              <Wrench size={13} /> {rep.service_date || 'Service Date'} ·{' '}
              <Badge variant="warning">{rep.service_type}</Badge>
            </div>
            <div className="mb-1.5 text-[1.05rem] font-bold text-foreground">{rep.title}</div>
            <div className="mb-2 text-sm text-muted-foreground">
              Provider: {rep.service_provider_name} · Status: <strong>{rep.status}</strong>
              <br />
              Notes: {rep.technician_notes || 'Service performed as scheduled.'}
            </div>
            <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-[0.8125rem] font-bold text-primary">
              + {formatMoney(rep.total_cost || (Number(rep.labor_cost || 0) + Number(rep.parts_cost || 0)))} (Labor: {formatMoney(rep.labor_cost || 0)}, Parts: {formatMoney(rep.parts_cost || 0)})
            </span>
          </TimelineItem>
        ))}

        {/* 5. Warranty */}
        {selectedAsset.warranty_expiry_date && (
          <TimelineItem dotColor={DOTS.amber} last>
            <div className="mb-1.5 flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
              <ShieldCheck size={13} /> {selectedAsset.warranty_expiry_date} ·{' '}
              <Badge variant="warning">Warranty Expiration</Badge>
            </div>
            <div className="mb-1.5 text-[1.05rem] font-bold text-foreground">
              Manufacturer Warranty Expiration Threshold
            </div>
            <div className="text-sm text-muted-foreground">
              End of standard coverage. LifeDesk alerts 30 days and 7 days prior to ensure uninterrupted AMC coverage.
            </div>
          </TimelineItem>
        )}
      </div>
    </div>
  )
}
