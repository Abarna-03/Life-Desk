import React from 'react'
import { IndianRupee, CreditCard, Wrench } from 'lucide-react'

import { KpiCard, KpiGrid, SectionHeader } from '@/components/common'
import { formatMoney } from '@/utils/formatters'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* Build 12 months of real spending for the current year.
   maint  → repair costs that fall in each month (by service_date)
   subs   → the normalized monthly recurring commitment, applied every month,
            plus any one-off renewals that land in a given month. */
function buildChartData(repairs, subscriptions, monthlyRecurring) {
  const year = new Date().getFullYear()
  const data = MONTHS.map((month) => ({ month, maint: 0, subs: Math.round(monthlyRecurring) }))

  repairs.forEach((r) => {
    const raw = r.service_date
    if (!raw) return
    const d = new Date(raw)
    if (Number.isNaN(d.getTime()) || d.getFullYear() !== year) return
    const cost = Number(r.total_cost || Number(r.labor_cost || 0) + Number(r.parts_cost || 0))
    data[d.getMonth()].maint += cost
  })

  return data
}

/* ---------- A single stacked bar (maintenance + subscriptions) ---------- */
function ChartBar({ month, maint, subs, max }) {
  const total = maint + subs
  const heightPct = max > 0 ? (total / max) * 100 : 0
  const barTotal = total || 1
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-end gap-2">
      <div
        className="flex w-full max-w-[48px] flex-col-reverse overflow-hidden rounded-t-md bg-muted transition-all"
        style={{ height: `${Math.max(heightPct, total > 0 ? 4 : 2)}%` }}
      >
        <div className="w-full bg-primary" style={{ height: `${(maint / barTotal) * 100}%` }} />
        <div className="w-full bg-amber-500" style={{ height: `${(subs / barTotal) * 100}%` }} />
      </div>
      <div className="text-xs font-semibold text-muted-foreground">{month}</div>
    </div>
  )
}

/* ---------- Monthly spending bar chart with legend ---------- */
function SpendingChart({ data }) {
  const max = Math.max(...data.map((d) => d.maint + d.subs), 1)
  const hasData = data.some((d) => d.maint + d.subs > 0)

  return (
    <div className="mb-8 rounded-xl border border-border bg-card p-7 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-extrabold tracking-tight text-foreground">
          Monthly Spending Trend (Maintenance vs Subscriptions)
        </h3>
        <div className="flex gap-4 text-[0.85rem]">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-primary" /> Maintenance &amp; Repairs
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-amber-500" /> Subscriptions &amp; AMCs
          </div>
        </div>
      </div>

      {hasData ? (
        <div className="flex h-60 items-end gap-5 border-b border-border pb-2 pt-8">
          {data.map((item) => (
            <ChartBar key={item.month} month={item.month} maint={item.maint} subs={item.subs} max={max} />
          ))}
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center gap-1 border-b border-border text-center">
          <p className="text-sm font-semibold text-foreground">No spending recorded yet</p>
          <p className="text-sm text-muted-foreground">
            Log a repair or add a subscription to see your monthly trend.
          </p>
        </div>
      )}
    </div>
  )
}

export default function Analytics({
  totalAssetValue,
  monthlyRecurring,
  totalRepairsCost,
  repairs = [],
  subscriptions = [],
}) {
  const chartData = buildChartData(repairs, subscriptions, monthlyRecurring)

  return (
    <div>
      <SectionHeader
        title="Spending Analytics"
        subtitle="Track long-term maintenance costs vs recurring commitments and asset depreciation."
      />

      {/* KPI Cards */}
      <KpiGrid className="mb-8">
        <KpiCard tone="blue" icon={IndianRupee} label="Total Spent On Assets" value={formatMoney(totalAssetValue)} />
        <KpiCard tone="purple" icon={CreditCard} label="Average Monthly Commitments" value={formatMoney(Math.round(monthlyRecurring))} />
        <KpiCard tone="amber" icon={Wrench} label="Cumulative Maintenance" value={formatMoney(totalRepairsCost)} />
      </KpiGrid>

      <SpendingChart data={chartData} />
    </div>
  )
}
