import React from 'react'
import { Lock, Database, LogOut, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import logo from '@/assets/lifedesk-logo-trim.png'

export default function Header({ backendConnected, currentUser, onLogout }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-3.5">
        {/* Brand */}
        <img
          src={logo}
          alt="LifeDesk — Everything in life, organized"
          className="h-12 w-auto object-contain"
        />

        {/* Status badges + user */}
        <div className="flex items-center gap-2">
          <Badge className="border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800">
            <Lock size={13} /> End-to-End Encrypted
          </Badge>
          <Badge className="border border-sky-200 bg-sky-50 px-3 py-1.5 text-sky-800">
            <Database size={13} />{' '}
            {backendConnected ? 'PostgreSQL Live (Port 5432)' : 'Local Ready'}
          </Badge>

          {currentUser && (
            <div className="ml-2 flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <User size={15} className="text-primary" />{' '}
                {currentUser.name || currentUser.email}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onLogout}
                title="Sign out of LifeHub"
              >
                <LogOut size={13} /> Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
