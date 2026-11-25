import type { Recipe } from '../types'
import { formatMinutes, totalMinutes } from '../lib'

interface Props {
  recipe: Recipe
  favorite: boolean
  onToggleFavorite: () => void
}

export function RecipeCard({ recipe, favorite, onToggleFavorite }: Props) {
  return (
    <article className={`card cat-${recipe.category.toLowerCase()}`}>
      <a className="card__link" href={`#/recipe/${recipe.id}`}>
        <div className="card__art" aria-hidden="true">
          {recipe.emoji}
        </div>
        <div className="card__body">
          <span className="card__category">
            {recipe.category}
            {recipe.shared && <span className="card__community"> · Community</span>}
          </span>
          <h3 className="card__title">{recipe.title}</h3>
          <p className="card__desc">{recipe.description}</p>
          <div className="card__meta">
            <span>⏱ {formatMinutes(totalMinutes(recipe))}</span>
            <span>🔥 {recipe.macros.calories} cal</span>
            <span>💪 {recipe.macros.protein}g protein</span>
          </div>
        </div>
      </a>
      <button
        type="button"
        className={favorite ? 'fav fav--on' : 'fav'}
        aria-pressed={favorite}
        aria-label={favorite ? `Remove ${recipe.title} from favorites` : `Save ${recipe.title} to favorites`}
        onClick={onToggleFavorite}
      >
        {favorite ? '♥' : '♡'}
      </button>
    </article>
  )
}
