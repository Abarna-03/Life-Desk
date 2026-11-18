import React from 'react'
import { IndianRupee, CreditCard, Wrench } from 'lucide-react'

import { KpiCard, KpiGrid, SectionHeader } from '@/components/common'
import { formatMoney } from '@/utils/formatters'

const chartData = [
  { month: 'Jan', maint: 0, subs: 85 },
  { month: 'Feb', maint: 140, subs: 85 },
  { month: 'Mar', maint: 65, subs: 85 },
  { month: 'Apr', maint: 0, subs: 85 },
  { month: 'May', maint: 0, subs: 85 },
  { month: 'Jun', maint: 0, subs: 85 },
  { month: 'Jul', maint: 120, subs: 85 },
  { month: 'Aug', maint: 0, subs: 85 },
  { month: 'Sep', maint: 0, subs: 85 },
  { month: 'Oct', maint: 0, subs: 85 },
  { month: 'Nov', maint: 85, subs: 540 },
  { month: 'Dec', maint: 0, subs: 85 },
]

/* ---------- A single stacked bar (maintenance + subscriptions) ---------- */
function ChartBar({ month, maint, subs }) {
  const total = maint + subs || 1
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-end gap-2">
      <div
        className="flex w-full max-w-[48px] flex-col-reverse overflow-hidden rounded-t-md bg-muted transition-all"
        style={{ height: `${Math.min(100, (maint + subs) / 7)}%` }}
      >
        <div className="w-full bg-primary" style={{ height: `${(maint / total) * 100}%` }} />
        <div className="w-full bg-amber-500" style={{ height: `${(subs / total) * 100}%` }} />
      </div>
      <div className="text-xs font-semibold text-muted-foreground">{month}</div>
    </div>
  )
}

/* ---------- Monthly spending bar chart with legend ---------- */
function SpendingChart({ data }) {
  return (
    <div className="mb-8 rounded-xl border border-border bg-card p-7 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[1.1rem] font-bold">
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

      <div className="flex h-60 items-end gap-5 border-b border-border pb-2 pt-8">
        {data.map((item) => (
          <ChartBar key={item.month} month={item.month} maint={item.maint} subs={item.subs} />
        ))}
      </div>
    </div>
  )
}

export default function Analytics({ totalAssetValue, monthlyRecurring, totalRepairsCost }) {
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
