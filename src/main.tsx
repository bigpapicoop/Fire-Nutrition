import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { noteNewVisitor } from './shared/newVisitor'

// Before the app saves anything, so returning users aren't mistaken for new ones.
noteNewVisitor()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Offline support for the installed app. Only in production builds, so `npm run dev` never serves stale files.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('Service worker failed to register', err))
  })
}
