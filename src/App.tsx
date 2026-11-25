import { useMemo, useState } from 'react'
import './App.css'
import { STARTER_RECIPES } from './data/recipes'
import { CATEGORIES } from './types'
import type { Category, Recipe } from './types'
import { slugify, totalMinutes, useHashRoute, useLocalStorage } from './lib'
import { RecipeCard } from './components/RecipeCard'
import { RecipeDetail } from './components/RecipeDetail'
import { RecipeForm } from './components/RecipeForm'
import { InstallPrompt } from './components/InstallPrompt'
import { UpdateBanner } from './components/UpdateBanner'
import { CalculatorPage } from './components/CalculatorPage'

type Filter = 'All' | 'Favorites' | Category
type Sort = 'name' | 'protein' | 'calories' | 'time'

const SORTS: Record<Sort, { label: string; fn: (a: Recipe, b: Recipe) => number }> = {
  name: { label: 'Name (A–Z)', fn: (a, b) => a.title.localeCompare(b.title) },
  protein: { label: 'Most protein', fn: (a, b) => b.macros.protein - a.macros.protein },
  calories: { label: 'Fewest calories', fn: (a, b) => a.macros.calories - b.macros.calories },
  time: { label: 'Quickest', fn: (a, b) => totalMinutes(a) - totalMinutes(b) },
}

function App() {
  const [route, navigate] = useHashRoute()
  const [customRecipes, setCustomRecipes] = useLocalStorage<Recipe[]>('cookbook.custom', [])
  const [favorites, setFavorites] = useLocalStorage<string[]>('cookbook.favorites', [])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [sort, setSort] = useState<Sort>('name')

  const allRecipes = useMemo(() => [...STARTER_RECIPES, ...customRecipes], [customRecipes])
  const favSet = useMemo(() => new Set(favorites), [favorites])

  const toggleFavorite = (id: string) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allRecipes
      .filter((r) => {
        if (filter === 'Favorites') return favSet.has(r.id)
        if (filter !== 'All') return r.category === filter
        return true
      })
      .filter(
        (r) =>
          !q ||
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.includes(q)) ||
          r.ingredients.some((i) => i.text.toLowerCase().includes(q)),
      )
      .sort(SORTS[sort].fn)
  }, [allRecipes, favSet, filter, query, sort])

  const addRecipe = (draft: Omit<Recipe, 'id'>) => {
    const base = slugify(draft.title)
    let id = base
    for (let n = 2; allRecipes.some((r) => r.id === id); n++) id = `${base}-${n}`
    setCustomRecipes((list) => [...list, { ...draft, id }])
    navigate(`/recipe/${id}`)
  }

  const deleteRecipe = (id: string) => {
    if (!window.confirm('Delete this recipe? This cannot be undone.')) return
    setCustomRecipes((list) => list.filter((r) => r.id !== id))
    setFavorites((f) => f.filter((x) => x !== id))
    navigate('/')
  }

  let page
  const detailMatch = route.match(/^\/recipe\/(.+)$/)
  if (detailMatch) {
    const recipe = allRecipes.find((r) => r.id === decodeURIComponent(detailMatch[1]))
    page = recipe ? (
      <RecipeDetail
        key={recipe.id}
        recipe={recipe}
        favorite={favSet.has(recipe.id)}
        onToggleFavorite={() => toggleFavorite(recipe.id)}
        onDelete={recipe.custom ? () => deleteRecipe(recipe.id) : undefined}
      />
    ) : (
      <div className="empty">
        <p>That recipe doesn't exist.</p>
        <a href="#/">Back to all recipes</a>
      </div>
    )
  } else if (route === '/new') {
    page = <RecipeForm onSave={addRecipe} onCancel={() => navigate('/')} />
  } else if (route === '/calculator') {
    page = <CalculatorPage />
  } else {
    const filters: Filter[] = ['All', ...CATEGORIES, 'Favorites']
    page = (
      <>
        <section className="intro">
          <h1>Cook smart. Train hard.</h1>
          <p>
            {allRecipes.length} macro-friendly recipes with servings you can scale. Save your favorites or add your
            own.
          </p>
          <a href="#/calculator" className="btn btn--ghost intro__calc">
            🧮 Nutrition calculator
          </a>
        </section>

        <div className="toolbar">
          <input
            type="search"
            className="search"
            placeholder="Search recipes, ingredients or tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search recipes"
          />
          <label className="sort">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              {(Object.keys(SORTS) as Sort[]).map((k) => (
                <option key={k} value={k}>
                  {SORTS[k].label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="chips" role="group" aria-label="Filter by category">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className={filter === f ? 'chip chip--on' : 'chip'}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === 'Favorites' ? `♥ Favorites (${favorites.length})` : f}
            </button>
          ))}
        </div>

        {visible.length ? (
          <div className="grid">
            {visible.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                favorite={favSet.has(r.id)}
                onToggleFavorite={() => toggleFavorite(r.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            {filter === 'Favorites' && !query ? (
              <p>No favorites yet. Tap ♡ on any recipe to save it here.</p>
            ) : query ? (
              <p>No recipes match “{query}”.</p>
            ) : (
              <p>No recipes in this category yet.</p>
            )}
          </div>
        )}
      </>
    )
  }

  return (
    <div className="app">
      <header className="topbar no-print">
        <a href="#/" className="brand">
          <img src="logo-mark.png" alt="" className="brand__logo" width="26" height="32" /> Fire Nutrition
        </a>
        <div className="topbar__actions">
          <InstallPrompt />
          {route !== '/new' && (
            <a href="#/new" className="btn btn--primary">
              + Add recipe
            </a>
          )}
        </div>
      </header>
      <UpdateBanner />
      <main>{page}</main>
      <footer className="footer no-print">Nutrition values are estimates per serving.</footer>
    </div>
  )
}

export default App
