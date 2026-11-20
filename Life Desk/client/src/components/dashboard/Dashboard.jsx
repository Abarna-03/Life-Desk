import React from 'react'
import { ChevronRight, Check, Circle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatMoney } from '@/utils/formatters'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS = ['#2563eb', '#7c3aed', '#0ea5e9', '#f59e0b', '#64748b']

/* ---------- Combined stat strip ---------- */
function Stat({ label, value, sub, subClass }) {
  return (
    <div className="flex flex-col gap-1 px-6 py-5">
      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display text-3xl font-extrabold leading-none tracking-tight text-foreground">
        {value}
      </div>
      {sub && <div className={cn('text-sm text-muted-foreground', subClass)}>{sub}</div>}
    </div>
  )
}

/* ---------- Panel header ---------- */
function PanelHeader({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-base font-extrabold tracking-tight text-foreground">
          {title}
        </h3>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* ---------- Segmented distribution bar ---------- */
function SegmentBar({ segments, total }) {
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
      {segments.map((s) => (
        <div
          key={s.label}
          className="h-full first:rounded-l-full last:rounded-r-full"
          style={{ width: `${(s.value / (total || 1)) * 100}%`, backgroundColor: s.color }}
          title={`${s.label}: ${s.value}`}
        />
      ))}
    </div>
  )
}

export default function Dashboard({
  assets = [],
  subscriptions = [],
  repairs = [],
  documents = [],
  totalAssetValue,
  currentUser,
  setActiveTab,
  setSelectedAsset,
  setShowAddAssetModal,
}) {
  const firstName = (currentUser?.name || currentUser?.email || 'there').split(' ')[0]
  const now = new Date()

  const isCovered = (a) => {
    if (!a.warranty_expiry_date) return false
    const exp = new Date(a.warranty_expiry_date)
    return !Number.isNaN(exp.getTime()) && exp >= now
  }

  const coveredCount = assets.filter(isCovered).length
  const notCoveredCount = assets.length - coveredCount
  const protectedPct = assets.length ? Math.round((coveredCount / assets.length) * 100) : 0
  const assetWord = assets.length === 1 ? 'asset' : 'assets'

  const categories = [...new Set(assets.map((a) => a.category).filter(Boolean))]

  const attentionItem = [...assets]
    .filter((a) => !isCovered(a))
    .sort((a, b) => Number(b.purchase_price || 0) - Number(a.purchase_price || 0))[0]

  const topAssets = [...assets]
    .sort((a, b) => Number(b.purchase_price || 0) - Number(a.purchase_price || 0))
    .slice(0, 6)

  /* portfolio value split by category */
  const byCategory = {}
  assets.forEach((a) => {
    const c = a.category || 'Other'
    byCategory[c] = (byCategory[c] || 0) + Number(a.purchase_price || 0)
  })
  const portfolioSegments = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value], i) => ({ label, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))

  const steps = [
    { label: 'Register your first asset', done: assets.length > 0 },
    { label: 'Add a subscription', done: subscriptions.length > 0 },
    { label: 'Upload a document', done: documents.length > 0 },
    { label: 'Log a repair', done: repairs.length > 0 },
  ]
  const stepsDone = steps.filter((s) => s.done).length

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A summary of your assets, coverage and upcoming actions.
        </p>
      </div>

      {/* Combined stat strip */}
      <Card className="grid grid-cols-2 gap-0 divide-border p-0 sm:grid-cols-4 sm:divide-x">
        <Stat
          label="Total asset value"
          value={formatMoney(totalAssetValue)}
          sub={`Across ${assets.length} registered ${assetWord}`}
        />
        <Stat
          label="Total assets"
          value={assets.length}
          sub={categories.length ? categories.slice(0, 3).join(', ') : 'No categories yet'}
        />
        <Stat
          label="Under warranty"
          value={coveredCount}
          sub={`${protectedPct}% of assets covered`}
          subClass="font-semibold text-emerald-600"
        />
        <Stat
          label="Action required"
          value={<span className={notCoveredCount > 0 ? 'text-amber-600' : ''}>{notCoveredCount}</span>}
          sub={notCoveredCount === 1 ? 'Asset without warranty' : 'Assets without warranty'}
        />
      </Card>

      {/* ===== Main grid ===== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">
          {/* Attention */}
          {attentionItem && (
            <Card className="flex-row flex-wrap items-center justify-between gap-4 border-l-4 border-l-amber-400 p-5">
              <div className="min-w-[240px] flex-1">
                <h3 className="font-display text-base font-extrabold tracking-tight text-foreground">
                  {attentionItem.name} has no warranty on record
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  This {formatMoney(attentionItem.purchase_price)} asset is currently unprotected. Add
                  warranty details or set a reminder to avoid unexpected repair costs.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedAsset(attentionItem)
                  setActiveTab('assets')
                }}
              >
                Add warranty
              </Button>
            </Card>
          )}

          {/* Asset register */}
          <Card className="p-6">
            <PanelHeader
              title="Asset register"
              subtitle="Your most valuable registered assets"
              action={
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('assets')}>
                  View all
                </Button>
              }
            />
            {topAssets.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No assets yet. Use <strong>Add asset</strong> to begin.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        <th className="pb-3 pr-3 font-bold">Asset</th>
                        <th className="pb-3 pr-3 font-bold">Category</th>
                        <th className="pb-3 pr-3 font-bold">Room</th>
                        <th className="pb-3 pr-3 text-right font-bold">Value</th>
                        <th className="pb-3 text-right font-bold">Warranty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topAssets.map((a) => {
                        const covered = isCovered(a)
                        return (
                          <tr
                            key={a.id}
                            onClick={() => {
                              setSelectedAsset(a)
                              setActiveTab('timeline')
                            }}
                            className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50"
                          >
                            <td className="py-3.5 pr-3 font-bold text-foreground">{a.name}</td>
                            <td className="py-3.5 pr-3 text-muted-foreground">{a.category}</td>
                            <td className="py-3.5 pr-3 text-muted-foreground">{a.location_room}</td>
                            <td className="py-3.5 pr-3 text-right font-extrabold tabular-nums text-foreground">
                              {formatMoney(a.purchase_price)}
                            </td>
                            <td className="py-3.5 text-right">
                              <span className="inline-flex items-center justify-end gap-1">
                                <Badge variant={covered ? 'success' : 'warning'}>
                                  {covered ? 'Covered' : 'No warranty'}
                                </Badge>
                                <ChevronRight size={16} className="text-muted-foreground" />
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                  Showing {topAssets.length} of {assets.length} {assetWord}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* RIGHT RAIL */}
        <div className="space-y-6">
          {/* Warranty coverage */}
          <Card className="p-6">
            <PanelHeader
              title="Warranty coverage"
              action={
                <Badge variant="secondary" className="rounded-full">
                  {assets.length} {assetWord}
                </Badge>
              }
            />
            <div className="mb-3 flex items-end gap-2">
              <span className="font-display text-4xl font-extrabold leading-none tracking-tight text-foreground">
                {protectedPct}%
              </span>
              <span className="pb-1 text-sm text-muted-foreground">of assets protected</span>
            </div>
            <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${protectedPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">
                  Covered <strong className="text-foreground">{coveredCount}</strong>
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-slate-400" />
                <span className="text-muted-foreground">
                  No warranty <strong className="text-foreground">{notCoveredCount}</strong>
                </span>
              </span>
            </div>
          </Card>

          {/* Portfolio by category */}
          <Card className="p-6">
            <PanelHeader title="Portfolio by category" />
            {portfolioSegments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add assets to see your value split.</p>
            ) : (
              <>
                <SegmentBar segments={portfolioSegments} total={totalAssetValue} />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                  {portfolioSegments.map((s) => {
                    const pct = Math.round((s.value / (totalAssetValue || 1)) * 100)
                    return (
                      <span key={s.label} className="flex items-center gap-2 text-sm">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-muted-foreground">{s.label}</span>
                        <strong className="text-foreground">{pct}%</strong>
                      </span>
                    )
                  })}
                </div>
              </>
            )}
          </Card>

          {/* Setup progress */}
          <Card className="p-6">
            <PanelHeader
              title="Setup progress"
              action={
                <span className="text-sm font-semibold text-muted-foreground">
                  {stepsDone} of {steps.length}
                </span>
              }
            />
            <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(stepsDone / steps.length) * 100}%` }}
              />
            </div>
            <ul className="space-y-3">
              {steps.map((s) => (
                <li key={s.label} className="flex items-center gap-2.5 text-sm">
                  {s.done ? (
                    <Check size={16} className="shrink-0 text-emerald-600" />
                  ) : (
                    <Circle size={16} className="shrink-0 text-muted-foreground/40" />
                  )}
                  <span className={cn(s.done ? 'font-semibold text-emerald-600' : 'text-foreground')}>
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
