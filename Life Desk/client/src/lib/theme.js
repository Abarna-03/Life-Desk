export const THEME_KEY = 'ld_theme'

// Returns the saved preference, or falls back to the OS setting.
export function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Applies a theme ('light' | 'dark') to the document.
export function applyTheme(theme) {
  const isDark = theme === 'dark'
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
}

// Persists an explicit choice and applies it.
export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
  applyTheme(theme)
}

// True when the user has not made an explicit choice yet.
export function isFollowingSystem() {
  return !localStorage.getItem(THEME_KEY)
}
