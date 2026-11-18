import React from 'react'
import {
  Sparkles,
  ArrowRight,
  Building,
  Car,
  ShieldCheck,
  FileText,
  Wrench,
  AlertTriangle,
  DollarSign,
  CreditCard,
  Plus,
  Calendar,
  Clock,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const pillIconStyles = {
  blue: 'bg-sky-100 text-sky-700',
  green: 'bg-emerald-100 text-emerald-700',
  purple: 'bg-violet-100 text-violet-700',
  yellow: 'bg-amber-100 text-amber-700',
  pink: 'bg-pink-100 text-pink-700',
}

const kpiIconStyles = {
  blue: 'bg-sky-100 text-sky-600',
  purple: 'bg-violet-100 text-violet-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
}

function OverviewPill({ tone, icon: Icon, count, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md cursor-pointer"
    >
      <div className={cn('flex items-center justify-center rounded-[0.625rem] p-2.5', pillIconStyles[tone])}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-xl font-extrabold leading-tight text-foreground">{count}</div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
      </div>
    </button>
  )
}

function KpiCard({ tone, icon: Icon, label, value }) {
  return (
    <Card className="flex-row items-center gap-5 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn('flex items-center justify-center rounded-xl p-3.5', kpiIconStyles[tone])}>
        <Icon size={24} />
      </div>
      <div>
        <div className="mb-1 text-[0.8125rem] font-semibold text-muted-foreground">{label}</div>
        <div className="text-[1.625rem] font-extrabold tracking-tight text-foreground">{value}</div>
      </div>
    </Card>
  )
}

export default function Dashboard({
  assets,
  subscriptions,
  repairs,
  documents,
  tasks,
  totalAssetValue,
  monthlyRecurring,
  totalRepairsCost,
  setActiveTab,
  setSelectedAsset,
  setShowAddAssetModal,
  setShowAddTaskModal,
}) {
  const vehiclesCount = assets.filter((a) => a.category === 'Vehicles').length
  const contractsCount = subscriptions.filter(
    (s) => s.category === 'Insurance' || s.category === 'AMC',
  ).length
  const openRepairsCount = repairs.filter((r) => r.status !== 'Completed').length

  const now = new Date()
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const expiringWarranties = assets.filter((a) => {
    if (!a.warranty_expiry_date) return false
    const exp = new Date(a.warranty_expiry_date)
    return exp >= now && exp <= in30Days
  })

  const upcomingRenewals = subscriptions.filter((s) => {
    if (!s.next_renewal_date) return false
    const ren = new Date(s.next_renewal_date)
    return ren >= now && ren <= in7Days
  })

  const urgentCount = expiringWarranties.length + upcomingRenewals.length

  return (
    <div>
      {/* AI Assistant Search Bar */}
      <div className="mb-7 flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
          <Sparkles size={16} /> AI Assistant
        </div>
        <Input
          type="text"
          className="h-auto flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          placeholder="Ask me anything about your household data, documents, warranty events, or savings..."
        />
        <Button type="button" variant="ghost" size="icon">
          <ArrowRight size={16} className="text-primary" />
        </Button>
      </div>

      {/* Quick Overview Category Cards */}
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <OverviewPill tone="blue" icon={Building} count={assets.length} label="Assets Owned" onClick={() => setActiveTab('assets')} />
        <OverviewPill tone="green" icon={Car} count={vehiclesCount} label="Vehicles" onClick={() => setActiveTab('assets')} />
        <OverviewPill tone="purple" icon={ShieldCheck} count={contractsCount} label="Contracts / AMC" onClick={() => setActiveTab('subscriptions')} />
        <OverviewPill tone="yellow" icon={FileText} count={documents.length} label="Vaulted Docs" onClick={() => setActiveTab('documents')} />
        <OverviewPill tone="pink" icon={Wrench} count={openRepairsCount} label="Open Repairs" onClick={() => setActiveTab('repairs')} />
      </div>

      {/* Urgent Attention Banner */}
      {urgentCount > 0 && (
        <div className="mb-7 flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
          <div className="flex items-center justify-center rounded-lg bg-amber-100 p-2 text-amber-700">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <div className="mb-1 text-[0.9375rem] font-bold text-amber-800">
              Urgent Attention Required ({urgentCount} items)
            </div>
            <div className="space-y-0.5 text-sm text-amber-700">
              {expiringWarranties.map((a) => (
                <div key={a.id}>
                  • <strong>{a.name}:</strong> Warranty expires on {a.warranty_expiry_date}. AMC renewal recommended.
                </div>
              ))}
              {upcomingRenewals.map((s) => (
                <div key={s.id}>
                  • <strong>{s.name}:</strong> Renewal payment of ${s.cost} due on {s.next_renewal_date}.
                </div>
              ))}
            </div>
          </div>
          <Button type="button" size="sm" onClick={() => setActiveTab('subscriptions')}>
            Review Actions
          </Button>
        </div>
      )}

      {/* Financial KPI Cards */}
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        <KpiCard tone="blue" icon={DollarSign} label="Total Asset Value" value={`$${totalAssetValue.toLocaleString()}`} />
        <KpiCard tone="purple" icon={CreditCard} label="Monthly Commitments" value={`$${Math.round(monthlyRecurring)}/mo`} />
        <KpiCard tone="emerald" icon={ShieldCheck} label="Active Protected Assets" value={`${assets.filter((a) => a.status === 'Active').length} Active`} />
        <KpiCard tone="amber" icon={Wrench} label="Total Maintenance YTD" value={`$${totalRepairsCost}`} />
      </div>

      {/* Two Column Layout */}
      <div className="mt-4 grid grid-cols-1 gap-7 lg:grid-cols-[1.2fr_1fr]">
        {/* Upcoming Actions */}
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                Upcoming Actions &amp; Tasks
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Maintenance schedules, filter replacements, and life tasks
              </p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddTaskModal(true)}>
              <Plus size={14} /> Add Task
            </Button>
          </div>

          <div className="flex flex-col gap-3.5">
            {tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
                No tasks yet. Click <strong>Add Task</strong> to schedule your first maintenance action!
              </div>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-[1.125rem] shadow-sm transition-colors hover:border-stone-300"
                >
                  <div>
                    <div className="mb-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {t.room}
                    </div>
                    <div className="text-base font-bold text-foreground">{t.title}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-amber-700">
                      <Calendar size={13} /> {t.due}
                    </div>
                  </div>
                  <Badge variant={t.priority === 'Urgent' ? 'danger' : 'success'}>
                    {t.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Household Belongings */}
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                Household Belongings
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">Most valuable registered assets</p>
            </div>
            <Button type="button" onClick={() => setShowAddAssetModal(true)}>
              <Plus size={14} /> Add Asset
            </Button>
          </div>

          <div className="flex flex-col gap-3.5">
            {assets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
                No assets registered yet. Click <strong>Add Asset</strong> to begin!
              </div>
            ) : (
              assets.slice(0, 3).map((asset) => (
                <Card key={asset.id} className="gap-0 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="info">{asset.category}</Badge>
                    <Badge variant="success">{asset.location_room}</Badge>
                  </div>
                  <div className="text-[1.05rem] font-bold text-foreground">{asset.name}</div>
                  <div className="mb-3 mt-1 text-[0.8125rem] text-muted-foreground">
                    Brand: {asset.brand || 'N/A'} · Model: {asset.model_number || 'N/A'}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="text-[1.15rem] font-extrabold text-primary">
                      ${Number(asset.purchase_price).toLocaleString()}
                    </div>
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
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
