import { useState } from 'react'
import type { CalcResult, LineResult } from '../nutrition/calc'
import { roundMacros } from '../nutrition/calc'
import { FOODS, FOOD_GROUPS } from '../nutrition/foods'
import { MacroStrip } from './MacroStrip'

interface Props {
  result: CalcResult
  servings: number
  choices: Record<string, string>
  onChoose: (line: string, foodId: string) => void
}

const ISSUE_TEXT = {
  'no-match': 'Not recognized. Pick the closest food from the list.',
  'no-weight': 'Needs an amount it can weigh, like "200 g", "1 cup" or "2 tbsp".',
  'no-amount': 'No amount, so not counted.',
  excluded: 'Not counted.',
} as const

function LineRow({ r, choice, onChoose }: { r: LineResult; choice: string; onChoose: (id: string) => void }) {
  const m = r.macros && roundMacros(r.macros)
  const warn = r.issue === 'no-match' || r.issue === 'no-weight'
  return (
    <li className={warn ? 'calc-line calc-line--warn' : r.issue ? 'calc-line calc-line--skip' : 'calc-line'}>
      <div className="calc-line__text">{r.line}</div>
      <div className="calc-line__row">
        <select
          value={choice}
          onChange={(e) => onChoose(e.target.value)}
          aria-label={`Food used for "${r.line}"`}
        >
          <option value="">{r.autoMatched && r.food ? `Auto: ${r.food.name}` : 'Auto: not recognized'}</option>
          <option value="none">Don't count this</option>
          {FOOD_GROUPS.map((g) => (
            <optgroup key={g} label={g}>
              {FOODS.filter((f) => f.group === g).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {m && r.grams !== undefined && (
          <span className="calc-line__nums">
            {Math.round(r.grams)} g · <strong>{m.calories} cal</strong> · {m.protein}P {m.carbs}C {m.fat}F
          </span>
        )}
      </div>
      {r.issue && <div className="calc-line__issue">{ISSUE_TEXT[r.issue]}</div>}
    </li>
  )
}

/** Live nutrition breakdown for a list of ingredient lines. */
export function NutritionCalculator({ result, servings, choices, onChoose }: Props) {
  // Opens automatically when something needs fixing, then stays open until the user closes it.
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const total = roundMacros(result.total)
  const ingredientCount = result.lines.length

  if (ingredientCount === 0) {
    return (
      <div className="calc calc--empty">
        Type your ingredients with their total amounts (like <code>900 g chicken breast</code> or{' '}
        <code>2 cups cooked rice</code>) and the nutrition per serving appears here.
      </div>
    )
  }

  return (
    <div className="calc">
      <div className="calc__summary">
        <div className="calc__head">
          <strong>Per serving</strong>
          <span className="muted">
            ({servings} {servings === 1 ? 'serving' : 'servings'})
          </span>
        </div>
        <MacroStrip macros={result.perServing} />
        <p className="muted small">
          Whole recipe: {total.calories} cal · {total.protein}g protein · {total.carbs}g carbs · {total.fat}g fat
        </p>
        <p className={result.problems ? 'calc__status calc__status--warn' : 'calc__status'}>
          {result.counted} of {ingredientCount} ingredients counted
          {result.problems > 0 && ` · ${result.problems} need${result.problems === 1 ? 's' : ''} a fix below`}
        </p>
      </div>

      <details
        className="calc__details"
        open={breakdownOpen || result.problems > 0}
        onToggle={(e) => setBreakdownOpen(e.currentTarget.open)}
      >
        <summary>Ingredient breakdown</summary>
        <ul className="calc__lines">
          {result.lines.map((r, i) => (
            <LineRow key={`${i}-${r.line}`} r={r} choice={choices[r.line] ?? ''} onChoose={(id) => onChoose(r.line, id)} />
          ))}
        </ul>
        <p className="muted small">
          Meat and fish are counted as raw weight unless the line says "cooked". Values are estimates from USDA data.
        </p>
      </details>
    </div>
  )
}
