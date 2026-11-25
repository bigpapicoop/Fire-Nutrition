import { useCallback, useEffect, useState } from 'react'
import type { Ingredient } from './types'

/** State that persists to localStorage; falls back to memory if storage is unavailable. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage blocked: keep in memory only */
    }
  }, [key, value])

  return [value, setValue] as const
}

/** Current location hash without the leading "#", e.g. "/recipe/turkey-chili". */
export function useHashRoute() {
  const read = () => window.location.hash.replace(/^#/, '') || '/'
  const [route, setRoute] = useState(read)

  useEffect(() => {
    const onChange = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((to: string) => {
    window.location.hash = to
  }, [])

  return [route, navigate] as const
}

const FRACTIONS: [number, string][] = [
  [0, ''],
  [1 / 8, '⅛'],
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [1 / 2, '½'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
  [1, ''],
]

/** Format a quantity for a recipe: 1.5 -> "1½", 0.333 -> "⅓", 337.5 -> "338". */
export function formatQty(n: number): string {
  if (n >= 20) return String(Math.round(n))
  let whole = Math.floor(n)
  const frac = n - whole
  let best = FRACTIONS[0]
  for (const f of FRACTIONS) if (Math.abs(frac - f[0]) < Math.abs(frac - best[0])) best = f
  if (best[0] === 1) whole += 1
  if (whole === 0 && best[1] === '') return n > 0 ? String(Number(n.toFixed(2))) : '0'
  return `${whole || ''}${best[1]}`
}

/** Parse a leading quantity like "2", "1.5", "1/2" or "1 1/2". */
function parseQty(s: string): number | undefined {
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3])
  const frac = s.match(/^(\d+)\/(\d+)$/)
  if (frac) return Number(frac[1]) / Number(frac[2])
  const num = Number(s)
  return Number.isFinite(num) ? num : undefined
}

const UNICODE_FRACTIONS: Record<string, string> = { '½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4', '⅛': '1/8' }

/** Tidy the start of a line: "1½" -> "1 1/2", "900g" -> "900 g", "2-3 cloves" -> "2.5 cloves". */
function normalizeLeadingQty(line: string): string {
  let s = line.trim().replace(/^-\s*|^•\s*/, '') // list bullets
  s = s.replace(/^(\d*)\s*([½⅓⅔¼¾⅛])/, (_, whole: string, f: string) => `${whole ? whole + ' ' : ''}${UNICODE_FRACTIONS[f]}`)
  s = s.replace(/^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\b/, (_, a: string, b: string) => String((Number(a) + Number(b)) / 2))
  s = s.replace(/^(\d+(?:\.\d+)?)([a-zA-Z]+)\b/, '$1 $2')
  return s
}

/** Turn "1 1/2 cups oats" into { qty: 1.5, text: "cups oats" }. Lines without a number keep qty undefined. */
export function parseIngredient(line: string): Ingredient {
  const s = normalizeLeadingQty(line)
  const m = s.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(.+)$/)
  if (m) {
    const qty = parseQty(m[1])
    if (qty !== undefined) return { qty, text: m[2].trim() }
  }
  return { text: line.trim() }
}

export function ingredientToLine(i: Ingredient): string {
  return i.qty === undefined ? i.text : `${formatQty(i.qty)} ${i.text}`
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'recipe'
  )
}

export function totalMinutes(r: { prepMinutes: number; cookMinutes: number }) {
  return r.prepMinutes + r.cookMinutes
}

export function formatMinutes(m: number) {
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest ? `${h} h ${rest} min` : `${h} h`
}
