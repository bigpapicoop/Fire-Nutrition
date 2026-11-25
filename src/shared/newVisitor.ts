import { supabase } from './db'

const SEEN_KEY = 'cookbook.seen'

function platform(): string {
  const ua = navigator.userAgent
  if (/iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'iPad'
  if (/iPhone|iPod/.test(ua)) return 'iPhone'
  if (/Android/.test(ua)) return 'Android'
  if (/CrOS/.test(ua)) return 'Chromebook'
  if (/Windows/.test(ua)) return 'Windows computer'
  if (/Macintosh/.test(ua)) return 'Mac'
  if (/Linux/.test(ua)) return 'Linux computer'
  return 'Other device'
}

/**
 * Sends ONE anonymous "new visitor" signal the first time this device opens the app,
 * which triggers a phone notification for the app owner. Nothing is sent after that.
 * Run before the app starts, so people who used the app before this existed aren't counted as new.
 */
export function noteNewVisitor() {
  if (!supabase || !import.meta.env.PROD) return
  let alreadyHere: boolean
  try {
    if (localStorage.getItem(SEEN_KEY)) return
    // Anyone with saved app data (favorites, cached recipes...) visited before this feature: not new.
    alreadyHere = Object.keys(localStorage).some((k) => k.startsWith('cookbook.'))
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    return // storage blocked: we couldn't remember them, so don't risk notifying on every visit
  }
  if (alreadyHere) return

  const installed =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  supabase
    .from('new_visitors')
    .insert({ platform: platform(), installed })
    .then(({ error }) => {
      if (error) {
        // Try again on the next visit.
        try {
          localStorage.removeItem(SEEN_KEY)
        } catch {
          /* ignore */
        }
      }
    })
}

/** The app owner's own devices never count as new visitors. */
export function markOwnerDevice() {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* ignore */
  }
}
