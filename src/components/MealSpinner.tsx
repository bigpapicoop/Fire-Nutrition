import { useEffect, useMemo, useRef, useState } from 'react'
import type { Recipe } from '../types'

const MEALS = ['Breakfast', 'Lunch', 'Dinner'] as const
type Meal = (typeof MEALS)[number]
const MEAL_EMOJI: Record<Meal, string> = { Breakfast: '🍳', Lunch: '🥪', Dinner: '🍽️' }

/** Most slices the wheel shows at once; bigger lists get a random handful each time. */
const MAX_SLICES = 10
const SIZE = 300
const C = SIZE / 2
const R = C - 6
const SLICE_COLORS = [
  { fill: 'var(--accent)', text: '#fff' },
  { fill: 'var(--carbs)', text: '#2a1f1a' },
  { fill: 'var(--fat)', text: '#fff' },
  { fill: 'var(--protein)', text: '#fff' },
]

/** Small string hash, so a given seed always picks the same handful of recipes. */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** A stable random handful: the same seed and recipes always give the same slices, even when the page redraws. */
function pick(list: Recipe[], n: number, seed: number): Recipe[] {
  return [...list].sort((a, b) => hash(seed + a.id) - hash(seed + b.id)).slice(0, n)
}

/** Point on the rim, `deg` degrees clockwise from the top. */
function rim(deg: number, radius = R) {
  const a = (deg * Math.PI) / 180
  return { x: C + radius * Math.sin(a), y: C - radius * Math.cos(a) }
}

function shortTitle(title: string) {
  return title.length > 16 ? `${title.slice(0, 15).trimEnd()}…` : title
}

export function MealSpinner({ recipes }: { recipes: Recipe[] }) {
  const [meal, setMeal] = useState<Meal>(() => {
    const h = new Date().getHours()
    return h < 11 ? 'Breakfast' : h < 16 ? 'Lunch' : 'Dinner'
  })
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9))
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Recipe | null>(null)
  const pending = useRef<Recipe | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const slices = useMemo(() => {
    const matching = recipes.filter((r) => r.category === meal)
    return matching.length > MAX_SLICES ? pick(matching, MAX_SLICES, seed) : matching
  }, [recipes, meal, seed])

  const seg = 360 / Math.max(slices.length, 1)

  const chooseMeal = (m: Meal) => {
    if (spinning) return
    setMeal(m)
    setWinner(null)
  }

  const spin = () => {
    if (spinning || !slices.length) return
    const index = Math.floor(Math.random() * slices.length)
    // Land somewhere inside the chosen slice (not always dead centre), under the pointer at the top.
    const inSlice = seg * (0.2 + Math.random() * 0.6)
    const target = (360 - (index * seg + inSlice)) % 360
    const current = ((rotation % 360) + 360) % 360
    const extra = (target - current + 360) % 360
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    pending.current = slices[index]
    setWinner(null)
    setSpinning(true)
    setRotation(rotation + (reduceMotion ? 360 : 360 * 6) + extra)
    // Backup in case the animation-finished event never arrives (e.g. the app was in the background).
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(finish, (reduceMotion ? 1000 : 4500) + 400)
  }

  function finish() {
    window.clearTimeout(timer.current)
    if (!pending.current) return
    setSpinning(false)
    setWinner(pending.current)
    pending.current = null
  }

  return (
    <section className="spinner" aria-labelledby="spinner-title">
      <div className="spinner__side">
        <h2 id="spinner-title">Can't decide? Spin for it 🎡</h2>
        <p className="spinner__hint">Pick a meal, spin the wheel, and cook whatever it lands on.</p>

        <div className="chips spinner__meals" role="group" aria-label="Choose a meal">
          {MEALS.map((m) => (
            <button
              key={m}
              type="button"
              className={meal === m ? 'chip chip--on' : 'chip'}
              aria-pressed={meal === m}
              onClick={() => chooseMeal(m)}
              disabled={spinning}
            >
              {MEAL_EMOJI[m]} {m}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn--primary spinner__go"
          onClick={spin}
          disabled={spinning || !slices.length}
        >
          {spinning ? 'Spinning…' : winner ? '🔄 Spin again' : '🎲 Spin the wheel'}
        </button>

        <div className="spinner__result" aria-live="polite">
          {winner && (
            <a href={`#/recipe/${encodeURIComponent(winner.id)}`} className="spinner__winner">
              <span className="spinner__winner-emoji" aria-hidden="true">
                {winner.emoji}
              </span>
              <span>
                <span className="spinner__winner-label">The wheel says:</span>
                <strong>{winner.title}</strong>
                <span className="spinner__winner-macros">
                  {winner.macros.calories} cal · {winner.macros.protein} g protein · Let's cook it →
                </span>
              </span>
            </a>
          )}
          {!slices.length && <p className="spinner__hint">No {meal.toLowerCase()} recipes yet. Add one to spin!</p>}
          {recipes.filter((r) => r.category === meal).length > MAX_SLICES && !spinning && (
            <button type="button" className="linkish" onClick={() => {
                setSeed((s) => s + 1)
                setWinner(null)
              }}>
              Shuffle which recipes are on the wheel
            </button>
          )}
        </div>
      </div>

      <div className="spinner__wheel-wrap">
        <svg className="spinner__pointer" viewBox="0 0 30 26" aria-hidden="true">
          <path d="M15 26 L2 2 Q15 -2 28 2 Z" />
        </svg>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className={spinning ? 'spinner__wheel spinner__wheel--spinning' : 'spinner__wheel'}
          style={{ transform: `rotate(${rotation}deg)` }}
          onTransitionEnd={finish}
          role="img"
          aria-label={`Wheel with ${slices.length} ${meal.toLowerCase()} recipes`}
        >
          <circle cx={C} cy={C} r={R + 4} className="spinner__rim" />
          {slices.map((r, i) => {
            const color = SLICE_COLORS[(i + (slices.length % 4 === 1 && i === slices.length - 1 ? 1 : 0)) % 4]
            const start = i * seg
            const mid = start + seg / 2
            const a = rim(start)
            const b = rim(start + seg)
            const shape =
              slices.length === 1 ? (
                <circle cx={C} cy={C} r={R} style={{ fill: color.fill }} />
              ) : (
                <path
                  d={`M${C} ${C} L${a.x} ${a.y} A${R} ${R} 0 ${seg > 180 ? 1 : 0} 1 ${b.x} ${b.y} Z`}
                  style={{ fill: color.fill }}
                />
              )
            return (
              <g key={r.id}>
                {shape}
                {/* Labels run along the slice; ones on the left half are flipped so they never read upside down. */}
                <g transform={`rotate(${mid > 180 ? mid + 90 : mid - 90} ${C} ${C})`}>
                  <text
                    x={mid > 180 ? C - R * 0.56 : C + R * 0.56}
                    y={C}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="spinner__label"
                    style={{ fill: color.text }}
                  >
                    {r.emoji} {shortTitle(r.title)}
                  </text>
                </g>
              </g>
            )
          })}
          <circle cx={C} cy={C} r={22} className="spinner__hub" />
          <text x={C} y={C} textAnchor="middle" dominantBaseline="central" className="spinner__hub-icon">
            🔥
          </text>
        </svg>
      </div>
    </section>
  )
}
