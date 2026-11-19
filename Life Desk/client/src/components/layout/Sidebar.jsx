import React from 'react'
import { LayoutGrid, Home, Clock, CreditCard, Wrench, FileText, BarChart2, LogOut } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import ThemeToggle from '@/components/layout/ThemeToggle'
import { cn } from '@/lib/utils'
import logo from '@/assets/lifedesk-logo-trim.png'

export default function Sidebar({
  activeTab,
  setActiveTab,
  counts = {},
  currentUser,
  onLogout,
}) {
  const items = [
    { key: 'dashboard', label: 'Home', icon: LayoutGrid },
    { key: 'assets', label: 'Assets', icon: Home, count: counts.assets },
    { key: 'timeline', label: 'Timeline', icon: Clock },
    { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: counts.subscriptions },
    { key: 'repairs', label: 'Repairs', icon: Wrench, count: counts.repairs },
    { key: 'documents', label: 'Documents', icon: FileText, count: counts.documents },
    { key: 'analytics', label: 'Analytics', icon: BarChart2 },
  ]

  const name = currentUser?.name || currentUser?.email || 'You'
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="sticky top-0 z-40 flex shrink-0 items-center gap-3 border-b border-black/10 bg-sidebar px-3 py-2.5 text-sidebar-foreground lg:h-screen lg:w-60 lg:flex-col lg:items-stretch lg:gap-0 lg:border-b-0 lg:px-3 lg:py-4">
      {/* Brand */}
      <div className="shrink-0 lg:mb-4 lg:border-b lg:border-white/10 lg:px-2 lg:pb-4">
        <img src={logo} alt="LifeDesk" className="h-9 w-auto object-contain lg:h-11" />
      </div>

      {/* Nav */}
      <nav className="flex flex-1 gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={cn(
                'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors cursor-pointer lg:w-full',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-sidebar-foreground hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="lg:flex-1 lg:text-left">{item.label}</span>
              {item.count != null && (
                <span
                  className={cn(
                    'ml-auto rounded-full px-1.5 py-0.5 text-[0.68rem] font-bold tabular-nums',
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-sidebar-foreground',
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="flex shrink-0 items-center gap-2.5 lg:mt-auto lg:border-t lg:border-white/10 lg:px-1 lg:pt-4">
        <Avatar className="size-9">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden min-w-0 flex-1 lg:block">
          <div className="truncate text-sm font-bold text-white">{currentUser?.name || 'You'}</div>
          <div className="truncate text-xs text-sidebar-foreground/70">{currentUser?.email}</div>
        </div>
        <ThemeToggle />
        <button
          type="button"
          onClick={onLogout}
          title="Sign out"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
        >
          <LogOut size={17} />
          <span className="hidden lg:inline">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
