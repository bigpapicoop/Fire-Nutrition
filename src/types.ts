export const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'] as const
export type Category = (typeof CATEGORIES)[number]

/** One ingredient line. `qty` scales with servings; `text` is the rest ("g chicken breast"). */
export interface Ingredient {
  qty?: number
  text: string
}

/** Nutrition per serving. */
export interface Macros {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Recipe {
  id: string
  title: string
  description: string
  category: Category
  emoji: string
  prepMinutes: number
  cookMinutes: number
  servings: number
  macros: Macros
  tags: string[]
  ingredients: Ingredient[]
  steps: string[]
  /** True for recipes the user added themselves (they can be deleted). */
  custom?: boolean
}
