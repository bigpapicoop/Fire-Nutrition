import { createClient } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import type { Category, Recipe } from '../types'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config'

export const sharedEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = sharedEnabled
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null

/** Shared recipes get ids like "s-<uuid>" so they never clash with built-in or on-device ones. */
const PREFIX = 's-'
const CACHE_KEY = 'cookbook.shared.cache'

interface Row {
  id: string
  created_at: string
  title: string
  description: string
  category: Category
  emoji: string
  prep_minutes: number
  cook_minutes: number
  servings: number
  macros: Recipe['macros']
  tags: string[]
  ingredients: Recipe['ingredients']
  steps: string[]
}

const fromRow = (r: Row): Recipe => ({
  id: PREFIX + r.id,
  title: r.title,
  description: r.description,
  category: r.category,
  emoji: r.emoji,
  prepMinutes: r.prep_minutes,
  cookMinutes: r.cook_minutes,
  servings: r.servings,
  macros: r.macros,
  tags: r.tags,
  ingredients: r.ingredients,
  steps: r.steps,
  shared: true,
})

const toRow = (r: Omit<Recipe, 'id'>) => ({
  title: r.title.slice(0, 120),
  description: r.description.slice(0, 500),
  category: r.category,
  emoji: r.emoji,
  prep_minutes: Math.min(1440, Math.round(r.prepMinutes)),
  cook_minutes: Math.min(1440, Math.round(r.cookMinutes)),
  servings: Math.min(100, Math.max(1, Math.round(r.servings))),
  macros: r.macros,
  tags: r.tags.slice(0, 20),
  ingredients: r.ingredients.slice(0, 100),
  steps: r.steps.slice(0, 100),
})

function readCache(): Recipe[] {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]') as Recipe[]
  } catch {
    return []
  }
}
function writeCache(list: Recipe[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list))
  } catch {
    /* storage blocked: fine, we just won't have an offline copy */
  }
}

/**
 * Recipes everyone has added. Loads from the database, keeps an offline copy,
 * and refreshes when the app comes back to the foreground.
 */
export function useSharedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>(readCache)
  const [status, setStatus] = useState<'idle' | 'loading' | 'offline'>('idle')

  const refresh = useCallback(async () => {
    if (!supabase) return
    setStatus('loading')
    const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: false })
    if (error || !data) {
      setStatus('offline')
      return
    }
    const list = (data as Row[]).map(fromRow)
    setRecipes(list)
    writeCache(list)
    setStatus('idle')
  }, [])

  useEffect(() => {
    refresh()
    const onVisible = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  /** Add a recipe for everyone. Returns the new recipe's id. */
  const add = async (draft: Omit<Recipe, 'id'>): Promise<string> => {
    if (!supabase) throw new Error('Shared recipes are not set up.')
    const { data, error } = await supabase.from('recipes').insert(toRow(draft)).select('*').single()
    if (error || !data) {
      throw new Error(
        navigator.onLine
          ? "Couldn't save the recipe. Please try again."
          : "You're offline. Connect to the internet to share a recipe.",
      )
    }
    const recipe = fromRow(data as Row)
    setRecipes((list) => {
      const next = [recipe, ...list]
      writeCache(next)
      return next
    })
    return recipe.id
  }

  /** Delete a recipe for everyone. Only works for admins; the database refuses anyone else. */
  const remove = async (id: string) => {
    if (!supabase) return
    const { data, error } = await supabase.from('recipes').delete().eq('id', id.slice(PREFIX.length)).select('id')
    if (error || !data?.length) throw new Error("Couldn't delete it. Make sure you're signed in as admin.")
    setRecipes((list) => {
      const next = list.filter((r) => r.id !== id)
      writeCache(next)
      return next
    })
  }

  return { recipes, status, refresh, add, remove }
}

/** The signed-in admin session, if any. */
export function useAdmin() {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let active = true
    const check = async (s: Session | null) => {
      setSession(s)
      if (!s) return setIsAdmin(false)
      const { data } = await client.from('admins').select('user_id').eq('user_id', s.user.id).maybeSingle()
      if (active) setIsAdmin(Boolean(data))
    }
    client.auth.getSession().then(({ data }) => check(data.session))
    const { data: sub } = client.auth.onAuthStateChange((_event, s) => {
      check(s)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { session, isAdmin }
}
