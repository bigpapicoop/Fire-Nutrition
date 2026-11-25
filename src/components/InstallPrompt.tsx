import { useEffect, useState } from 'react'
import { useLocalStorage } from '../lib'

/** Chrome/Edge/Android event that lets us show the native "Install app" dialog. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

/**
 * Android / desktop Chrome: an "Install app" button that opens the browser's install dialog.
 * iPhone / iPad: Safari has no install dialog, so show a one-line how-to the user can dismiss.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [iosHintDismissed, setIosHintDismissed] = useLocalStorage('cookbook.iosHintDismissed', false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null

  if (deferred) {
    return (
      <button
        type="button"
        className="btn btn--ghost"
        onClick={async () => {
          await deferred.prompt()
          await deferred.userChoice
          setDeferred(null)
        }}
      >
        ⬇ Install app
      </button>
    )
  }

  if (isIos() && !iosHintDismissed) {
    return (
      <div className="ios-hint" role="note">
        <span>
          Install on your iPhone: tap <strong>Share</strong> <span aria-hidden="true">⎋</span> then{' '}
          <strong>Add to Home Screen</strong>.
        </span>
        <button type="button" aria-label="Dismiss install tip" onClick={() => setIosHintDismissed(true)}>
          ✕
        </button>
      </div>
    )
  }

  return null
}
