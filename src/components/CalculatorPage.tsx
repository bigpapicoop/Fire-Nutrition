import { useMemo, useState } from 'react'
import { useLocalStorage } from '../lib'
import { calculateNutrition } from '../nutrition/calc'
import { NutritionCalculator } from './NutritionCalculator'

/** Standalone calculator: paste ingredients, get nutrition per serving without saving a recipe. */
export function CalculatorPage() {
  // Remembered between visits so a half-typed list isn't lost.
  const [ingredients, setIngredients] = useLocalStorage('cookbook.calc.ingredients', '')
  const [servings, setServings] = useLocalStorage('cookbook.calc.servings', '4')
  const [choices, setChoices] = useState<Record<string, string>>({})

  const servingCount = Math.max(1, Math.round(Number(servings) || 1))
  const lines = useMemo(
    () =>
      ingredients
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    [ingredients],
  )
  const result = useMemo(() => calculateNutrition(lines, servingCount, choices), [lines, servingCount, choices])

  return (
    <div className="form panel">
      <a href="#/" className="back">
        ← All recipes
      </a>
      <h1>Nutrition calculator</h1>
      <p className="muted" style={{ margin: 0 }}>
        Type everything that goes into the dish with its total amount. You'll get calories, protein, carbs and fat per
        serving.
      </p>

      <div className="calc-inputs">
        <label className="field">
          <span>Ingredients</span>
          <textarea
            rows={9}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={'900 g chicken breast\n1 tbsp olive oil\n12 small corn tortillas\n1/2 can black beans\n1 cup salsa'}
          />
        </label>
        <label className="field calc-inputs__servings">
          <span>Servings</span>
          <input type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} />
        </label>
      </div>

      <NutritionCalculator
        result={result}
        servings={servingCount}
        choices={choices}
        onChoose={(line, id) => setChoices((c) => ({ ...c, [line]: id }))}
      />

      {lines.length > 0 && (
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={() => setIngredients('')}>
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
