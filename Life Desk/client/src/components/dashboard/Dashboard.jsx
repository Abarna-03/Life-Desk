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
  IndianRupee,
  CreditCard,
  Plus,
  Calendar,
  Clock,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AlertBanner,
  EmptyState,
  KpiCard,
  KpiGrid,
  OverviewPill,
  SectionHeader,
} from '@/components/common'
import { formatMoney } from '@/utils/formatters'

/* ---------- AI Assistant search bar ---------- */
function AiAssistantBar() {
  return (
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
  )
}

/* ---------- A single upcoming task row ---------- */
function TaskItem({ task }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-[1.125rem] shadow-sm transition-colors hover:border-stone-300">
      <div>
        <div className="mb-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {task.room}
        </div>
        <div className="text-base font-bold text-foreground">{task.title}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-amber-700">
          <Calendar size={13} /> {task.due}
        </div>
      </div>
      <Badge variant={task.priority === 'Urgent' ? 'danger' : 'success'}>{task.priority}</Badge>
    </div>
  )
}

/* ---------- A compact asset card for the dashboard ---------- */
function BelongingCard({ asset, onTimeline }) {
  return (
    <Card className="gap-0 p-5">
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
          {formatMoney(asset.purchase_price)}
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={onTimeline}>
          <Clock size={14} /> Timeline
        </Button>
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
      <AiAssistantBar />

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
        <AlertBanner
          tone="amber"
          icon={AlertTriangle}
          title={`Urgent Attention Required (${urgentCount} items)`}
          className="mb-7"
          action={
            <Button type="button" size="sm" onClick={() => setActiveTab('subscriptions')}>
              Review Actions
            </Button>
          }
        >
          {expiringWarranties.map((a) => (
            <div key={a.id}>
              • <strong>{a.name}:</strong> Warranty expires on {a.warranty_expiry_date}. AMC renewal recommended.
            </div>
          ))}
          {upcomingRenewals.map((s) => (
            <div key={s.id}>
              • <strong>{s.name}:</strong> Renewal payment of {formatMoney(s.cost)} due on {s.next_renewal_date}.
            </div>
          ))}
        </AlertBanner>
      )}

      {/* Financial KPI Cards */}
      <KpiGrid className="mb-8">
        <KpiCard tone="blue" icon={IndianRupee} label="Total Asset Value" value={formatMoney(totalAssetValue)} />
        <KpiCard tone="purple" icon={CreditCard} label="Monthly Commitments" value={`${formatMoney(Math.round(monthlyRecurring))}/mo`} />
        <KpiCard tone="emerald" icon={ShieldCheck} label="Active Protected Assets" value={`${assets.filter((a) => a.status === 'Active').length} Active`} />
        <KpiCard tone="amber" icon={Wrench} label="Total Maintenance YTD" value={formatMoney(totalRepairsCost)} />
      </KpiGrid>

      {/* Two Column Layout */}
      <div className="mt-4 grid grid-cols-1 gap-7 lg:grid-cols-[1.2fr_1fr]">
        {/* Upcoming Actions */}
        <div>
          <SectionHeader
            as="h3"
            title="Upcoming Actions & Tasks"
            subtitle="Maintenance schedules, filter replacements, and life tasks"
            action={
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddTaskModal(true)}>
                <Plus size={14} /> Add Task
              </Button>
            }
          />

          <div className="flex flex-col gap-3.5">
            {tasks.length === 0 ? (
              <EmptyState
                className="p-8"
                message={
                  <p className="text-muted-foreground">
                    No tasks yet. Click <strong>Add Task</strong> to schedule your first maintenance action!
                  </p>
                }
              />
            ) : (
              tasks.map((t) => <TaskItem key={t.id} task={t} />)
            )}
          </div>
        </div>

        {/* Household Belongings */}
        <div>
          <SectionHeader
            as="h3"
            title="Household Belongings"
            subtitle="Most valuable registered assets"
            action={
              <Button type="button" onClick={() => setShowAddAssetModal(true)}>
                <Plus size={14} /> Add Asset
              </Button>
            }
          />

          <div className="flex flex-col gap-3.5">
            {assets.length === 0 ? (
              <EmptyState
                className="p-8"
                message={
                  <p className="text-muted-foreground">
                    No assets registered yet. Click <strong>Add Asset</strong> to begin!
                  </p>
                }
              />
            ) : (
              assets.slice(0, 3).map((asset) => (
                <BelongingCard
                  key={asset.id}
                  asset={asset}
                  onTimeline={() => {
                    setSelectedAsset(asset)
                    setActiveTab('timeline')
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
