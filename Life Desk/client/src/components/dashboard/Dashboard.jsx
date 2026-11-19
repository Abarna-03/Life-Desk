import React from 'react'
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Plus,
  Calendar,
  Clock,
  Circle,
  CheckCircle2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AlertBanner, EmptyState, SectionHeader } from '@/components/common'
import { formatMoney } from '@/utils/formatters'
import { cn } from '@/lib/utils'

/* ---------- Prominent AI ask bar (preview only) ---------- */
function AskBar() {
  return (
    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm ring-1 ring-primary/5">
      <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
        <Sparkles size={16} /> Ask AI
      </div>
      <Input
        type="text"
        className="h-auto flex-1 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
        placeholder="Ask about your belongings, warranties, renewals or spending…"
      />
      <Button type="button" size="icon" variant="brand" className="rounded-full">
        <ArrowRight size={16} />
      </Button>
    </div>
  )
}

/* ---------- A single stat tile ---------- */
function StatTile({ label, value, className }) {
  return (
    <Card className={cn('justify-center gap-1 p-5', className)}>
      <div className="font-display text-2xl font-extrabold tracking-tight text-foreground">
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </Card>
  )
}

/* ---------- A compact asset card ---------- */
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

/* ---------- A single task row you can tick off ---------- */
function TaskItem({ task, onToggle }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3.5 shadow-sm transition-colors hover:border-primary/30">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? 'Mark task not done' : 'Mark task done'}
        className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-primary"
      >
        {task.done ? (
          <CheckCircle2 className="size-5 text-primary" />
        ) : (
          <Circle className="size-5" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'text-base font-bold text-foreground',
            task.done && 'text-muted-foreground line-through',
          )}
        >
          {task.title}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-wide">{task.room}</span>
          <span className="flex items-center gap-1 text-amber-600">
            <Calendar size={12} /> {task.due}
          </span>
        </div>
      </div>
      <Badge variant={task.priority === 'Urgent' ? 'danger' : 'success'}>{task.priority}</Badge>
    </div>
  )
}

export default function Dashboard({
  assets,
  subscriptions,
  tasks,
  currentUser,
  totalAssetValue,
  monthlyRecurring,
  totalRepairsCost,
  setActiveTab,
  setSelectedAsset,
  setShowAddAssetModal,
  setShowAddTaskModal,
  onToggleTask,
}) {
  const firstName = (currentUser?.name || currentUser?.email || 'there').split(' ')[0]
  const activeProtected = assets.filter((a) => a.status === 'Active').length

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

  const assetWord = assets.length === 1 ? 'asset' : 'assets'
  const contractWord = subscriptions.length === 1 ? 'contract' : 'contracts'

  return (
    <div>
      {/* Greeting + plain-language summary */}
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
        Welcome back, {firstName} <span className="align-middle">👋</span>
      </h1>
      <p className="mt-2 max-w-3xl text-lg leading-relaxed text-muted-foreground">
        You own{' '}
        <span className="font-bold text-foreground">
          {assets.length} {assetWord}
        </span>{' '}
        worth <span className="font-bold text-brand-brass">{formatMoney(totalAssetValue)}</span>, with{' '}
        <span className="font-bold text-brand-brass">
          {formatMoney(Math.round(monthlyRecurring))}
        </span>{' '}
        a month going to{' '}
        <span className="font-bold text-foreground">
          {subscriptions.length} {contractWord}
        </span>
        , and <span className="font-bold text-brand-brass">{formatMoney(totalRepairsCost)}</span> spent
        on repairs this year.
      </p>

      <AskBar />

      {/* Hero split — big worth tile on the left, stat tiles on the right */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col justify-center gap-1.5 p-7">
          <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Total worth
          </div>
          <div className="font-display text-5xl font-extrabold tracking-tight text-brand-brass">
            {formatMoney(totalAssetValue)}
          </div>
          <div className="text-sm text-muted-foreground">
            Across {assets.length} {assetWord}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <StatTile label="Per month" value={formatMoney(Math.round(monthlyRecurring))} />
          <StatTile label="Protected" value={`${activeProtected}`} />
          <StatTile
            label="Repairs this year"
            value={formatMoney(totalRepairsCost)}
            className="col-span-2"
          />
        </div>
      </div>

      {urgentCount > 0 && (
        <AlertBanner
          tone="amber"
          icon={AlertTriangle}
          title={`${urgentCount} thing${urgentCount > 1 ? 's' : ''} need your attention`}
          className="mt-6"
          action={
            <Button type="button" size="sm" onClick={() => setActiveTab('subscriptions')}>
              Review
            </Button>
          }
        >
          {expiringWarranties.map((a) => (
            <div key={a.id}>
              • <strong>{a.name}:</strong> warranty expires {a.warranty_expiry_date}.
            </div>
          ))}
          {upcomingRenewals.map((s) => (
            <div key={s.id}>
              • <strong>{s.name}:</strong> {formatMoney(s.cost)} renewal due {s.next_renewal_date}.
            </div>
          ))}
        </AlertBanner>
      )}

      {/* Belongings + Coming up */}
      <div className="mt-8 grid grid-cols-1 gap-7 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <SectionHeader
            as="h2"
            title="Your belongings"
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
                    No belongings yet. Click <strong>Add Asset</strong> to begin.
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

        <div>
          <SectionHeader
            as="h2"
            title="Coming up"
            subtitle="Tasks and reminders"
            action={
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddTaskModal(true)}>
                <Plus size={14} /> Add Task
              </Button>
            }
          />
          <div className="flex flex-col gap-3">
            {tasks.length === 0 ? (
              <EmptyState
                className="p-8"
                message={
                  <p className="text-muted-foreground">
                    Nothing scheduled. Click <strong>Add Task</strong> to add one.
                  </p>
                }
              />
            ) : (
              tasks.map((t) => <TaskItem key={t.id} task={t} onToggle={onToggleTask} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
