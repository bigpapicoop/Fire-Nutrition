import type { Macros } from '../types'
import { parseIngredient } from '../lib'
import { FOODS, FOOD_BY_ID } from './foods'
import type { Food } from './foods'

/** How a unit converts to grams. */
type UnitKind = 'mass' | 'volume' | 'piece' | 'can'

const UNITS: Record<string, { kind: UnitKind; factor: number; label: string }> = {}
function unit(names: string[], kind: UnitKind, factor: number, label: string) {
  for (const n of names) UNITS[n] = { kind, factor, label }
}
// mass: factor = grams per unit
unit(['g', 'gram', 'grams', 'gr'], 'mass', 1, 'g')
unit(['kg', 'kilo', 'kilos', 'kilogram', 'kilograms'], 'mass', 1000, 'kg')
unit(['oz', 'ounce', 'ounces'], 'mass', 28.35, 'oz')
unit(['lb', 'lbs', 'pound', 'pounds'], 'mass', 453.6, 'lb')
// volume: factor = fraction of a cup
unit(['cup', 'cups', 'c'], 'volume', 1, 'cup')
unit(['tbsp', 'tbsps', 'tablespoon', 'tablespoons', 'tbs', 'tbl'], 'volume', 1 / 16, 'tbsp')
unit(['tsp', 'tsps', 'teaspoon', 'teaspoons'], 'volume', 1 / 48, 'tsp')
unit(['ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres'], 'volume', 1 / 240, 'ml')
unit(['l', 'liter', 'liters', 'litre', 'litres'], 'volume', 1000 / 240, 'L')
unit(['pint', 'pints'], 'volume', 2, 'pint')
// pieces: factor = number of pieces
unit(
  ['piece', 'pieces', 'whole', 'large', 'medium', 'small', 'clove', 'cloves', 'slice', 'slices', 'scoop', 'scoops',
    'fillet', 'fillets', 'breast', 'breasts', 'thigh', 'thighs', 'head', 'heads', 'bunch', 'bunches', 'stalk', 'stalks',
    'handful', 'handfuls', 'link', 'links', 'strip', 'strips', 'leaf', 'leaves', 'sprig', 'sprigs'],
  'piece', 1, 'piece',
)
unit(['can', 'cans', 'tin', 'tins', 'jar', 'jars'], 'can', 1, 'can')

export type LineIssue = 'no-amount' | 'no-match' | 'no-weight' | 'excluded'

export interface LineResult {
  line: string
  /** Food used (auto-matched or chosen). */
  food?: Food
  autoMatched: boolean
  grams?: number
  macros?: Macros
  issue?: LineIssue
}

export interface CalcResult {
  lines: LineResult[]
  total: Macros
  perServing: Macros
  counted: number
  problems: number
}

const ZERO: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 }

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // jalapeño -> jalapeno
    .replace(/[-_/]/g, ' ')

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const MATCHERS = FOODS.flatMap((food) =>
  food.aliases.map((alias) => ({
    food,
    length: alias.length,
    re: new RegExp(`\\b${escapeRe(normalize(alias))}(?:s|es)?\\b`),
  })),
)

/** Best food for a piece of text: the one whose longest alias appears in it. */
export function matchFood(text: string): Food | undefined {
  const t = normalize(text)
  let best: { food: Food; length: number } | undefined
  for (const m of MATCHERS) if (m.length > (best?.length ?? 0) && m.re.test(t)) best = m
  return best?.food
}

/** "(800 g)" / "(150 g each)" / "(15 oz)" inside a line -> grams per unit. */
function parentheticalGrams(text: string): number | undefined {
  const m = text.match(/\((\d+(?:\.\d+)?)\s*(g|grams?|kg|oz|ounces?|ml|lb|lbs)\b[^)]*\)/i)
  if (!m) return undefined
  const u = UNITS[m[2].toLowerCase()]
  if (!u) return undefined
  return u.kind === 'mass' ? Number(m[1]) * u.factor : Number(m[1]) // ml ≈ g
}

/** Work out the grams of `food` described by `qty` + the rest of the line. */
function toGrams(qty: number, rest: string, food: Food): number | undefined {
  const firstWord = rest.split(/[\s,(]+/)[0]?.toLowerCase().replace(/\.$/, '') ?? ''
  const u = UNITS[firstWord]
  const paren = parentheticalGrams(rest)

  if (u?.kind === 'mass') return qty * u.factor
  if (u?.kind === 'volume') {
    if (firstWord.startsWith('m') || firstWord === 'l' || firstWord.startsWith('lit')) {
      // ml / L: use the food's density when known, otherwise water.
      const ml = qty * u.factor * 240
      return food.cupG ? (ml / 240) * food.cupG : ml
    }
    return qty * u.factor * (food.cupG ?? 240)
  }
  if (u?.kind === 'can') {
    if (paren !== undefined) {
      // Canned beans/corn are listed by drained weight: about 60% of the can's net weight.
      const drained = food.group === 'Beans & legumes' || food.id === 'corn'
      return qty * paren * (drained ? 0.6 : 1)
    }
    return food.canG !== undefined ? qty * food.canG : undefined
  }
  // A piece count: "3 eggs", "2 medium sweet potatoes", "4 salmon fillets (150 g each)".
  if (paren !== undefined) return qty * paren
  return food.pieceG !== undefined ? qty * food.pieceG : undefined
}

function macrosFor(food: Food, grams: number): Macros {
  const k = grams / 100
  return {
    calories: food.per100g.calories * k,
    protein: food.per100g.protein * k,
    carbs: food.per100g.carbs * k,
    fat: food.per100g.fat * k,
  }
}

const add = (a: Macros, b: Macros): Macros => ({
  calories: a.calories + b.calories,
  protein: a.protein + b.protein,
  carbs: a.carbs + b.carbs,
  fat: a.fat + b.fat,
})

/**
 * Calculate nutrition for a list of ingredient lines.
 * `choices` maps a line's text to a food id the user picked, or "none" to leave it out.
 */
export function calculateNutrition(lines: string[], servings: number, choices: Record<string, string> = {}): CalcResult {
  const results: LineResult[] = lines.map((line) => {
    const choice = choices[line]
    if (choice === 'none') return { line, autoMatched: false, issue: 'excluded' }

    const { qty, text } = parseIngredient(line)
    const chosen = choice ? FOOD_BY_ID.get(choice) : undefined
    const food = chosen ?? matchFood(text)
    const autoMatched = !chosen

    if (!food) return { line, autoMatched, issue: 'no-match' }
    if (qty === undefined) return { line, food, autoMatched, issue: 'no-amount' }
    const grams = toGrams(qty, text, food)
    if (grams === undefined) return { line, food, autoMatched, issue: 'no-weight' }
    return { line, food, autoMatched, grams, macros: macrosFor(food, grams) }
  })

  const total = results.reduce((sum, r) => (r.macros ? add(sum, r.macros) : sum), ZERO)
  const n = Math.max(1, servings)
  return {
    lines: results,
    total,
    perServing: {
      calories: total.calories / n,
      protein: total.protein / n,
      carbs: total.carbs / n,
      fat: total.fat / n,
    },
    counted: results.filter((r) => r.macros).length,
    // "No amount" lines like "salt to taste" aren't problems; unknown foods and missing weights are.
    problems: results.filter((r) => r.issue === 'no-match' || r.issue === 'no-weight').length,
  }
}

/** Round to whole calories and grams, the way the recipe stores them. */
export function roundMacros(m: Macros): Macros {
  return {
    calories: Math.round(m.calories),
    protein: Math.round(m.protein),
    carbs: Math.round(m.carbs),
    fat: Math.round(m.fat),
  }
}
