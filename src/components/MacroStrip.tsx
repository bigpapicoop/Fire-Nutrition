import type { Macros } from '../types'

interface Props {
  macros: Macros
  compact?: boolean
}

/** Calories plus protein / carbs / fat, with a bar showing where the calories come from. */
export function MacroStrip({ macros, compact }: Props) {
  const p = macros.protein * 4
  const c = macros.carbs * 4
  const f = macros.fat * 9
  const total = p + c + f || 1

  return (
    <div className={compact ? 'macros macros--compact' : 'macros'}>
      <div className="macros__numbers">
        <span className="macro macro--cal">
          <strong>{Math.round(macros.calories)}</strong> cal
        </span>
        <span className="macro macro--p">
          <strong>{Math.round(macros.protein)}g</strong> protein
        </span>
        <span className="macro macro--c">
          <strong>{Math.round(macros.carbs)}g</strong> carbs
        </span>
        <span className="macro macro--f">
          <strong>{Math.round(macros.fat)}g</strong> fat
        </span>
      </div>
      <div
        className="macros__bar"
        role="img"
        aria-label={`Calories from protein ${Math.round((p / total) * 100)}%, carbs ${Math.round(
          (c / total) * 100,
        )}%, fat ${Math.round((f / total) * 100)}%`}
      >
        <span className="seg seg--p" style={{ width: `${(p / total) * 100}%` }} />
        <span className="seg seg--c" style={{ width: `${(c / total) * 100}%` }} />
        <span className="seg seg--f" style={{ width: `${(f / total) * 100}%` }} />
      </div>
    </div>
  )
}
