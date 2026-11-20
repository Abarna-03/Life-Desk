import React from 'react'
import { Sun, Moon } from 'lucide-react'

import { getInitialTheme, setTheme } from '@/lib/theme'

export default function ThemeToggle() {
  const [theme, setThemeState] = React.useState(getInitialTheme)

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setThemeState(next)
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
