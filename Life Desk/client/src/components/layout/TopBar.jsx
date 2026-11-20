import React from 'react'
import { Sparkles, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

const TAB_LABELS = {
  dashboard: 'Home',
  analytics: 'Analytics',
  timeline: 'Timeline',
  assets: 'Assets',
  subscriptions: 'Subscriptions',
  repairs: 'Repairs',
  documents: 'Documents',
}

export default function TopBar({ activeTab, onAddAsset }) {
  const label = TAB_LABELS[activeTab] || 'Home'

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-background/80 px-6 py-3 backdrop-blur lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-muted-foreground">LifeDesk</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-bold text-foreground">{label}</span>
      </div>

      {/* Ask AI search */}
      <button
        type="button"
        className="ml-auto hidden min-w-0 max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex cursor-pointer"
      >
        <Sparkles size={15} className="shrink-0 text-primary" />
        <span className="truncate">Ask AI about your assets, warranties or spending</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-border bg-card px-1.5 py-0.5 font-sans text-[0.7rem] font-semibold text-muted-foreground md:inline">
          ⌘K
        </kbd>
      </button>

      <Button type="button" size="sm" className="ml-auto shrink-0 sm:ml-0" onClick={onAddAsset}>
        <Plus size={15} /> Add asset
      </Button>
    </header>
  )
}
