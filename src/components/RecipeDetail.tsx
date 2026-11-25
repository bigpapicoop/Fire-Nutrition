import { useState } from 'react'
import type { Recipe } from '../types'
import { formatMinutes, formatQty, totalMinutes } from '../lib'
import { MacroStrip } from './MacroStrip'

interface Props {
  recipe: Recipe
  favorite: boolean
  onToggleFavorite: () => void
  onDelete?: () => void
}

export function RecipeDetail({ recipe, favorite, onToggleFavorite, onDelete }: Props) {
  const [servings, setServings] = useState(recipe.servings)
  const [haveIngredient, setHaveIngredient] = useState<Set<number>>(new Set())
  const [doneStep, setDoneStep] = useState<Set<number>>(new Set())

  const scale = servings / recipe.servings
  const totals = {
    calories: recipe.macros.calories * servings,
    protein: recipe.macros.protein * servings,
    carbs: recipe.macros.carbs * servings,
    fat: recipe.macros.fat * servings,
  }

  const toggle = (set: Set<number>, i: number) => {
    const next = new Set(set)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    return next
  }

  return (
    <article className={`detail cat-${recipe.category.toLowerCase()}`}>
      <div className="detail__top no-print">
        <a href="#/" className="back">
          ← All recipes
        </a>
        <div className="detail__actions">
          {onDelete && (
            <button type="button" className="btn btn--danger" onClick={onDelete}>
              Delete
            </button>
          )}
          <button
            type="button"
            className={favorite ? 'btn btn--fav btn--fav-on' : 'btn btn--fav'}
            aria-pressed={favorite}
            onClick={onToggleFavorite}
          >
            {favorite ? '♥ Added to favorites' : '♡ Add to favorites'}
          </button>
        </div>
      </div>

      <header className="detail__hero">
        <div className="detail__art" aria-hidden="true">
          {recipe.emoji}
        </div>
        <div>
          <span className="card__category">{recipe.category}</span>
          <h1 className="detail__title">{recipe.title}</h1>
          {recipe.description && <p className="detail__desc">{recipe.description}</p>}
          <dl className="facts">
            <div>
              <dt>Prep</dt>
              <dd>{formatMinutes(recipe.prepMinutes)}</dd>
            </div>
            <div>
              <dt>Cook</dt>
              <dd>{formatMinutes(recipe.cookMinutes)}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{formatMinutes(totalMinutes(recipe))}</dd>
            </div>
          </dl>
          {recipe.tags.length > 0 && (
            <ul className="tags">
              {recipe.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <section className="panel">
        <div className="panel__head">
          <h2>Nutrition</h2>
          <span className="muted">per serving</span>
        </div>
        <MacroStrip macros={recipe.macros} />
        {servings > 1 && (
          <p className="muted small">
            Whole batch ({servings} servings): {Math.round(totals.calories)} cal · {Math.round(totals.protein)}g
            protein · {Math.round(totals.carbs)}g carbs · {Math.round(totals.fat)}g fat
          </p>
        )}
      </section>

      <div className="detail__cols">
        <section className="panel">
          <div className="panel__head">
            <h2>Ingredients</h2>
            <div className="stepper no-print" aria-label="Servings">
              <button
                type="button"
                aria-label="Fewer servings"
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                disabled={servings <= 1}
              >
                −
              </button>
              <span>
                <strong>{servings}</strong> {servings === 1 ? 'serving' : 'servings'}
              </span>
              <button type="button" aria-label="More servings" onClick={() => setServings((s) => s + 1)}>
                +
              </button>
            </div>
          </div>
          {scale !== 1 && (
            <p className="muted small no-print">
              Scaled from {recipe.servings} servings.{' '}
              <button type="button" className="linkish" onClick={() => setServings(recipe.servings)}>
                Reset
              </button>
            </p>
          )}
          <ul className="checklist">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                <label className={haveIngredient.has(i) ? 'checked' : ''}>
                  <input
                    type="checkbox"
                    checked={haveIngredient.has(i)}
                    onChange={() => setHaveIngredient((s) => toggle(s, i))}
                  />
                  <span>
                    {ing.qty !== undefined && <strong>{formatQty(ing.qty * scale)} </strong>}
                    {ing.text}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Method</h2>
            <span className="muted">
              {doneStep.size}/{recipe.steps.length} done
            </span>
          </div>
          <ol className="steps">
            {recipe.steps.map((step, i) => (
              <li key={i} className={doneStep.has(i) ? 'done' : ''}>
                <button type="button" onClick={() => setDoneStep((s) => toggle(s, i))} aria-pressed={doneStep.has(i)}>
                  <span className="steps__num">{doneStep.has(i) ? '✓' : i + 1}</span>
                  <span>{step}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  )
}
