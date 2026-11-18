import React from 'react'
import { DollarSign, CreditCard, Wrench } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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

const kpiIconStyles = {
  blue: 'bg-sky-100 text-sky-600',
  purple: 'bg-violet-100 text-violet-600',
  amber: 'bg-amber-100 text-amber-600',
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

export default function CostAnalytics({ totalAssetValue, monthlyRecurring, totalRepairsCost }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">
          Cost &amp; Maintenance Analytics
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Track long-term maintenance costs vs recurring commitments and asset depreciation.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        <KpiCard tone="blue" icon={DollarSign} label="Total Spent On Assets" value={`$${totalAssetValue.toLocaleString()}`} />
        <KpiCard tone="purple" icon={CreditCard} label="Average Monthly Commitments" value={`$${Math.round(monthlyRecurring)}`} />
        <KpiCard tone="amber" icon={Wrench} label="Cumulative Maintenance" value={`$${totalRepairsCost}`} />
      </div>

      {/* Bar Chart */}
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
          {chartData.map((item, idx) => {
            const total = item.maint + item.subs || 1
            return (
              <div key={idx} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="flex w-full max-w-[48px] flex-col-reverse overflow-hidden rounded-t-md bg-muted transition-all"
                  style={{ height: `${Math.min(100, (item.maint + item.subs) / 7)}%` }}
                >
                  <div className="w-full bg-primary" style={{ height: `${(item.maint / total) * 100}%` }} />
                  <div className="w-full bg-amber-500" style={{ height: `${(item.subs / total) * 100}%` }} />
                </div>
                <div className="text-xs font-semibold text-muted-foreground">{item.month}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
