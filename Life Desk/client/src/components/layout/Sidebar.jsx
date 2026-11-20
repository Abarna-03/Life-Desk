import React from 'react'
import {
  LayoutGrid,
  BarChart2,
  Clock,
  Home,
  CreditCard,
  Wrench,
  FileText,
  House,
  LogOut,
} from 'lucide-react'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import ThemeToggle from '@/components/layout/ThemeToggle'
import { cn } from '@/lib/utils'

export default function Sidebar({
  activeTab,
  setActiveTab,
  counts = {},
  currentUser,
  onLogout,
}) {
  const sections = [
    {
      label: 'Overview',
      items: [
        { key: 'dashboard', label: 'Home', icon: LayoutGrid },
        { key: 'analytics', label: 'Analytics', icon: BarChart2 },
        { key: 'timeline', label: 'Timeline', icon: Clock },
      ],
    },
    {
      label: 'Manage',
      items: [
        { key: 'assets', label: 'Assets', icon: Home, count: counts.assets },
        { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: counts.subscriptions },
        { key: 'repairs', label: 'Repairs', icon: Wrench, count: counts.repairs },
        { key: 'documents', label: 'Documents', icon: FileText, count: counts.documents },
      ],
    },
  ]

  const name = currentUser?.name || currentUser?.email || 'You'
  const avatarUrl =
    currentUser?.avatar || currentUser?.avatarUrl || currentUser?.photo || ''
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const renderItem = (item) => {
    const Icon = item.icon
    const isActive = activeTab === item.key
    return (
      <button
        key={item.key}
        type="button"
        onClick={() => setActiveTab(item.key)}
        className={cn(
          'flex w-full shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
          isActive
            ? 'bg-sidebar-active font-semibold text-white'
            : 'text-sidebar-foreground hover:bg-white/5 hover:text-white',
        )}
      >
        <Icon size={18} className="shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {item.count != null && item.count > 0 && (
          <span
            className={cn(
              'ml-auto rounded-full px-1.5 py-0.5 text-[0.68rem] font-bold tabular-nums',
              isActive ? 'bg-white/15 text-white' : 'bg-white/10 text-sidebar-foreground',
            )}
          >
            {item.count}
          </span>
        )}
      </button>
    )
  }

  return (
    <aside className="sticky top-0 z-40 flex shrink-0 items-center gap-3 bg-sidebar px-3 py-2.5 text-sidebar-foreground lg:h-screen lg:w-64 lg:flex-col lg:items-stretch lg:gap-0 lg:px-3 lg:py-5">
      {/* Brand */}
      <div className="flex shrink-0 items-center gap-2.5 px-2 lg:mb-6">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <House size={18} />
        </span>
        <span className="font-display text-lg font-extrabold tracking-tight text-white">
          LifeDesk
        </span>
      </div>

      {/* Nav sections */}
      <nav className="flex flex-1 gap-1 overflow-x-auto lg:flex-col lg:gap-0 lg:overflow-visible">
        {sections.map((section) => (
          <div key={section.label} className="contents lg:mb-6 lg:block">
            <div className="hidden px-3 pb-2 text-[0.68rem] font-bold uppercase tracking-wider text-sidebar-muted lg:block">
              {section.label}
            </div>
            <div className="flex gap-1 lg:flex-col lg:gap-1">
              {section.items.map(renderItem)}
            </div>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="flex shrink-0 items-center gap-2.5 lg:mt-auto lg:border-t lg:border-white/10 lg:px-1 lg:pt-4">
        <Avatar className="size-9 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-white/10 text-sm font-bold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={onLogout}
          className="hidden min-w-0 flex-1 text-left lg:block cursor-pointer"
          title="Sign out"
        >
          <div className="truncate text-sm font-bold text-white">{currentUser?.name || 'You'}</div>
          <div className="flex items-center gap-1 text-xs text-sidebar-foreground transition-colors hover:text-red-300">
            <LogOut size={12} /> Sign out
          </div>
        </button>
        <ThemeToggle />
        <button
          type="button"
          onClick={onLogout}
          title="Sign out"
          className="flex shrink-0 items-center justify-center rounded-lg p-2 text-sidebar-foreground transition-colors hover:bg-white/10 hover:text-white cursor-pointer lg:hidden"
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  )
}
