import React from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/* ============================================================
   common.jsx — small, reusable app UI building blocks.
   These compose the shadcn primitives (Card/Button/Badge/…)
   into the repeated patterns used across every screen.
   ============================================================ */

/* ---------- SectionHeader ----------
   Title + optional subtitle on the left, optional action node on the right.
   Used at the top of every screen and for in-page subsections. */
export function SectionHeader({ title, subtitle, action, as: Heading = 'h2', className }) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-center justify-between gap-4', className)}>
      <div>
        <Heading className="font-display text-xl font-extrabold tracking-tight text-foreground">
          {title}
        </Heading>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* ---------- KpiCard ----------
   Icon tile + label + big value. Used on Dashboard and Analytics. */
const KPI_ICON_TONES = {
  blue: 'bg-sky-100 text-sky-600',
  purple: 'bg-violet-100 text-violet-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
}

export function KpiCard({ tone = 'blue', icon: Icon, label, value }) {
  return (
    <Card className="flex-row items-center gap-5 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn('flex items-center justify-center rounded-xl p-3.5', KPI_ICON_TONES[tone])}>
        <Icon size={24} />
      </div>
      <div>
        <div className="mb-1 text-[0.8125rem] font-semibold text-muted-foreground">{label}</div>
        <div className="text-[1.625rem] font-extrabold tracking-tight text-foreground">{value}</div>
      </div>
    </Card>
  )
}

/* Grid wrappers so screens don't repeat the long auto-fit/auto-fill strings. */
export function KpiGrid({ children, className }) {
  return (
    <div className={cn('grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5', className)}>
      {children}
    </div>
  )
}

export function CardsGrid({ children, className }) {
  return (
    <div className={cn('grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6', className)}>
      {children}
    </div>
  )
}

/* ---------- OverviewPill ----------
   Clickable category tile (count + label). Used on the Dashboard. */
const PILL_ICON_TONES = {
  blue: 'bg-sky-100 text-sky-700',
  green: 'bg-emerald-100 text-emerald-700',
  purple: 'bg-violet-100 text-violet-700',
  yellow: 'bg-amber-100 text-amber-700',
  pink: 'bg-pink-100 text-pink-700',
}

export function OverviewPill({ tone = 'blue', icon: Icon, count, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md cursor-pointer"
    >
      <div className={cn('flex items-center justify-center rounded-[0.625rem] p-2.5', PILL_ICON_TONES[tone])}>
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

/* ---------- EntityCard + bars ----------
   The hover-lift card shell with an optional colored top bar and footer,
   used by Assets / Subscriptions / Repairs / Documents. */
export function EntityCard({ children, className, ...props }) {
  return (
    <Card
      className={cn(
        'justify-between gap-0 overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  )
}

const TOP_BAR_TONES = {
  gold: 'bg-amber-100 text-amber-800 border-amber-200',
  green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  teal: 'bg-teal-50 text-teal-800 border-teal-200',
  gray: 'bg-muted text-muted-foreground border-border',
}

export function CardTopBar({ tone = 'gray', children, className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-b px-5 py-3 text-[0.8125rem] font-bold',
        TOP_BAR_TONES[tone],
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardFooterBar({ children, className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-t border-border bg-muted/40 px-5 py-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

/* ---------- AlertBanner ----------
   A colored notice banner with an icon, title, body, and optional action.
   Used for the dashboard's "urgent attention" strip. */
const BANNER_TONES = {
  amber: {
    wrap: 'border-amber-200 bg-amber-50',
    icon: 'bg-amber-100 text-amber-700',
    title: 'text-amber-800',
    body: 'text-amber-700',
  },
  sky: {
    wrap: 'border-sky-200 bg-sky-50',
    icon: 'bg-sky-100 text-sky-700',
    title: 'text-sky-800',
    body: 'text-sky-700',
  },
  rose: {
    wrap: 'border-rose-200 bg-rose-50',
    icon: 'bg-rose-100 text-rose-700',
    title: 'text-rose-800',
    body: 'text-rose-700',
  },
}

export function AlertBanner({ tone = 'amber', icon: Icon, title, action, children, className }) {
  const t = BANNER_TONES[tone]
  return (
    <div
      className={cn('flex items-start gap-4 rounded-xl border px-5 py-4 shadow-sm', t.wrap, className)}
    >
      {Icon && (
        <div className={cn('flex items-center justify-center rounded-lg p-2', t.icon)}>
          <Icon size={24} />
        </div>
      )}
      <div className="flex-1">
        {title && <div className={cn('mb-1 text-[0.9375rem] font-bold', t.title)}>{title}</div>}
        <div className={cn('space-y-0.5 text-sm', t.body)}>{children}</div>
      </div>
      {action}
    </div>
  )
}

/* ---------- EmptyState ----------
   Dashed placeholder with a message and an optional action.
   `fullWidth` spans a full card grid row. */
export function EmptyState({ message, action, fullWidth = false, className }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-border bg-card p-12 text-center',
        fullWidth && 'col-span-full',
        className,
      )}
    >
      {typeof message === 'string' ? (
        <p className="text-muted-foreground">{message}</p>
      ) : (
        message
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
