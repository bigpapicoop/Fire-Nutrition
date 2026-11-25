import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CATEGORIES } from '../types'
import type { Category, Recipe } from '../types'
import { parseIngredient } from '../lib'
import { calculateNutrition, roundMacros } from '../nutrition/calc'
import { NutritionCalculator } from './NutritionCalculator'

interface Props {
  onSave: (recipe: Omit<Recipe, 'id'>) => void
  onCancel: () => void
}

const EMOJIS = ['🍲', '🥗', '🍳', '🥩', '🍗', '🐟', '🍝', '🌮', '🥑', '🍠', '🥞', '🍪', '🍰', '🥤']

const toLines = (s: string) =>
  s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

export function RecipeForm({ onSave, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('Dinner')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [prep, setPrep] = useState('10')
  const [cook, setCook] = useState('20')
  const [servings, setServings] = useState('4')
  const [autoNutrition, setAutoNutrition] = useState(true)
  const [foodChoices, setFoodChoices] = useState<Record<string, string>>({})
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [tags, setTags] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')
  const [error, setError] = useState('')

  const num = (s: string) => {
    const n = Number(s)
    return Number.isFinite(n) && n >= 0 ? n : 0
  }
  const servingCount = Math.max(1, Math.round(num(servings)))
  const ingredientLines = useMemo(() => toLines(ingredients), [ingredients])
  const calc = useMemo(
    () => calculateNutrition(ingredientLines, servingCount, foodChoices),
    [ingredientLines, servingCount, foodChoices],
  )
  const calculated = roundMacros(calc.perServing)

  const switchToManual = () => {
    // Start the manual fields from the calculated numbers so they can be tweaked.
    if (calc.counted > 0) {
      setCalories(String(calculated.calories))
      setProtein(String(calculated.protein))
      setCarbs(String(calculated.carbs))
      setFat(String(calculated.fat))
    }
    setAutoNutrition(false)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const stepLines = toLines(steps)
    if (!title.trim()) return setError('Give the recipe a name.')
    if (ingredientLines.length === 0) return setError('Add at least one ingredient.')
    if (stepLines.length === 0) return setError('Add at least one step.')
    if (autoNutrition && calc.counted === 0)
      return setError('None of the ingredients could be counted. Fix them in the breakdown, or enter nutrition by hand.')

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      emoji,
      prepMinutes: num(prep),
      cookMinutes: num(cook),
      servings: servingCount,
      macros: autoNutrition
        ? calculated
        : { calories: num(calories), protein: num(protein), carbs: num(carbs), fat: num(fat) },
      tags: tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      ingredients: ingredientLines.map(parseIngredient),
      steps: stepLines,
      custom: true,
    })
  }

  return (
    <form className="form panel" onSubmit={submit} noValidate>
      <a href="#/" className="back">
        ← All recipes
      </a>
      <h1>Add a recipe</h1>

      <label className="field">
        <span>Name</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Grandma's turkey meatballs" autoFocus />
      </label>

      <label className="field">
        <span>Short description</span>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes it good?" />
      </label>

      <div className="field">
        <span>Icon</span>
        <div className="emoji-pick" role="radiogroup" aria-label="Icon">
          {EMOJIS.map((em) => (
            <button
              type="button"
              key={em}
              role="radio"
              aria-checked={emoji === em}
              className={emoji === em ? 'on' : ''}
              onClick={() => setEmoji(em)}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-4">
        <label className="field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Prep (min)</span>
          <input type="number" min="0" value={prep} onChange={(e) => setPrep(e.target.value)} />
        </label>
        <label className="field">
          <span>Cook (min)</span>
          <input type="number" min="0" value={cook} onChange={(e) => setCook(e.target.value)} />
        </label>
        <label className="field">
          <span>Servings</span>
          <input type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>Ingredients</span>
        <small className="muted">
          One per line, with the total amount for the whole recipe: <code>900 g chicken breast</code>,{' '}
          <code>1 1/2 cups rice</code>, <code>2 tbsp olive oil</code>, <code>3 eggs</code>.
        </small>
        <textarea
          rows={7}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder={'500 g lean ground turkey\n1/2 cup breadcrumbs\n1 egg\n1 cup marinara\nSalt and pepper to taste'}
        />
      </label>

      <fieldset className="field">
        <legend>Nutrition per serving</legend>
        <div className="mode-toggle" role="radiogroup" aria-label="How to get nutrition">
          <button
            type="button"
            role="radio"
            aria-checked={autoNutrition}
            className={autoNutrition ? 'on' : ''}
            onClick={() => setAutoNutrition(true)}
          >
            Calculate from ingredients
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!autoNutrition}
            className={!autoNutrition ? 'on' : ''}
            onClick={switchToManual}
          >
            Enter by hand
          </button>
        </div>

        {autoNutrition ? (
          <NutritionCalculator
            result={calc}
            servings={servingCount}
            choices={foodChoices}
            onChoose={(line, id) => setFoodChoices((c) => ({ ...c, [line]: id }))}
          />
        ) : (
          <div className="grid-4">
            <label className="field">
              <span>Calories</span>
              <input type="number" min="0" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </label>
            <label className="field">
              <span>Protein (g)</span>
              <input type="number" min="0" value={protein} onChange={(e) => setProtein(e.target.value)} />
            </label>
            <label className="field">
              <span>Carbs (g)</span>
              <input type="number" min="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
            </label>
            <label className="field">
              <span>Fat (g)</span>
              <input type="number" min="0" value={fat} onChange={(e) => setFat(e.target.value)} />
            </label>
          </div>
        )}
      </fieldset>

      <label className="field">
        <span>Steps</span>
        <small className="muted">One step per line.</small>
        <textarea
          rows={6}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder={'Heat the oven to 400°F.\nMix everything and roll into balls.\nBake 18 minutes.'}
        />
      </label>

      <label className="field">
        <span>Tags</span>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="high-protein, meal-prep" />
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          Save recipe
        </button>
      </div>
    </form>
  )
}
