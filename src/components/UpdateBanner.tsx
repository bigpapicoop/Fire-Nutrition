import { useEffect, useState } from 'react'

const CHECK_EVERY_MS = 5 * 60 * 1000 // while the app is open
const MIN_GAP_MS = 30 * 1000 // don't re-check more often than this

/** URL of the app bundle this page is running, e.g. https://site/assets/index-AbC123.js */
function currentBundle(): string | undefined {
  const s = document.querySelector<HTMLScriptElement>('script[type="module"][src*="assets/"]')
  return s?.src
}

/** URL of the app bundle the server has now. A new deploy gives the bundle a new name. */
async function latestBundle(): Promise<string | undefined> {
  const res = await fetch(`./index.html?check=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) return undefined
  const html = await res.text()
  const m = html.match(/<script[^>]+type="module"[^>]+src="([^"]*assets\/[^"]+\.js)"/)
  return m ? new URL(m[1], res.url).href : undefined
}

/**
 * Shows "New version available" when a newer deploy is online.
 * Checks when the app opens, when you switch back to it, and every few minutes while it's open.
 * Only runs in the built app (not `npm run dev`, which already updates live).
 */
export function UpdateBanner() {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    if (!import.meta.env.PROD) return
    const running = currentBundle()
    if (!running) return

    let last = 0
    let stopped = false
    const check = async () => {
      if (stopped || !navigator.onLine || Date.now() - last < MIN_GAP_MS) return
      last = Date.now()
      try {
        const latest = await latestBundle()
        if (!stopped && latest && latest !== running) setAvailable(true)
      } catch {
        /* offline or server hiccup: try again later */
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    const first = window.setTimeout(check, 3000)
    const timer = window.setInterval(check, CHECK_EVERY_MS)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', check)
    return () => {
      stopped = true
      window.clearTimeout(first)
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', check)
    }
  }, [])

  if (!available) return null

  return (
    <div className="update-bar no-print" role="status">
      <span>A new version of Fire Nutrition is available.</span>
      <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
        Update now
      </button>
    </div>
  )
}
