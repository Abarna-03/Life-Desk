import React from 'react'
import { Layers, Home, Clock, CreditCard, Wrench, FileText, BarChart2 } from 'lucide-react'

import { cn } from '@/lib/utils'

export default function NavTabs({
  activeTab,
  setActiveTab,
  assetsCount = 0,
  subscriptionsCount = 0,
  repairsCount = 0,
  documentsCount = 0,
}) {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: Layers },
    { key: 'assets', label: `Assets (${assetsCount})`, icon: Home },
    { key: 'timeline', label: 'Timeline', icon: Clock },
    { key: 'subscriptions', label: `Subscriptions (${subscriptionsCount})`, icon: CreditCard },
    { key: 'repairs', label: `Repairs (${repairsCount})`, icon: Wrench },
    { key: 'documents', label: `Documents (${documentsCount})`, icon: FileText },
    { key: 'analytics', label: 'Analytics', icon: BarChart2 },
  ]

  return (
    <div className="overflow-x-auto border-b border-border bg-card">
      <nav className="mx-auto flex max-w-[1400px] gap-1 px-6 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer',
                isActive
                  ? 'bg-primary/10 font-bold text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon size={16} /> {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
