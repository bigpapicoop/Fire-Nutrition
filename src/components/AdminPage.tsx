import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../shared/db'

interface Props {
  session: Session | null
  isAdmin: boolean
}

/**
 * Admin sign-in with email + password (the admin account is created in the Supabase dashboard).
 * Signing in alone gives no powers: only accounts listed in the database's `admins` table can delete.
 */
export function AdminPage({ session, isAdmin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  if (!supabase) {
    return (
      <div className="form panel">
        <a href="#/" className="back">
          ← All recipes
        </a>
        <h1>Admin</h1>
        <p className="muted">Shared recipes aren't set up yet, so there's nothing to manage.</p>
      </div>
    )
  }
  const client = supabase

  const signIn = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return setMessage('Enter your email and password.')
    setBusy(true)
    setMessage('')
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) {
      setMessage(navigator.onLine ? 'Wrong email or password.' : "You're offline. Connect to the internet to sign in.")
      return
    }
    setPassword('')
  }

  return (
    <div className="form panel">
      <a href="#/" className="back">
        ← All recipes
      </a>
      <h1>Admin</h1>

      {session ? (
        <>
          <p style={{ margin: 0 }}>
            Signed in as <strong>{session.user.email}</strong>.
          </p>
          {isAdmin ? (
            <p className="admin-ok">
              ✓ You're an admin. Open any community recipe and you'll see a <strong>Delete</strong> button.
            </p>
          ) : (
            <p className="error">This account isn't an admin, so it can't delete recipes.</p>
          )}
          <div className="form__actions" style={{ justifyContent: 'flex-start' }}>
            <button type="button" className="btn btn--ghost" onClick={() => client.auth.signOut()}>
              Sign out
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={signIn} className="admin-form">
          <p className="muted" style={{ margin: 0 }}>
            For the app owner. Sign in to remove community recipes.
          </p>
          <label className="field">
            <span>Email</span>
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <div className="form__actions" style={{ justifyContent: 'flex-start' }}>
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>
      )}

      {message && <p className="error">{message}</p>}
    </div>
  )
}
