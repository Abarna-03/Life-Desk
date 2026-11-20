import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyTheme, getInitialTheme, isFollowingSystem } from './lib/theme'

// Apply the saved or system theme before first paint.
applyTheme(getInitialTheme())

// Keep following the OS until the user makes an explicit choice.
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (isFollowingSystem()) applyTheme(e.matches ? 'dark' : 'light')
  })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
