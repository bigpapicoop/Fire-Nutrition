/**
 * Built-in food list used by the nutrition calculator.
 *
 * Values are per 100 g, rounded from USDA FoodData Central. Meat and fish are RAW weights
 * unless the name says "cooked". Beans are cooked or canned and drained.
 *
 * cupG:   grams in 1 cup (tbsp = cupG / 16, tsp = cupG / 48).
 * pieceG: grams in one "piece" (1 egg, 1 medium onion, 1 clove garlic, 1 scoop powder...).
 * canG:   grams in one can (drained, for beans).
 */
export interface Food {
  id: string
  name: string
  group: FoodGroup
  /** Words or phrases that identify this food in an ingredient line. The longest match wins. */
  aliases: string[]
  per100g: { calories: number; protein: number; carbs: number; fat: number }
  cupG?: number
  pieceG?: number
  canG?: number
}

export type FoodGroup =
  | 'Meat, fish & eggs'
  | 'Dairy & protein'
  | 'Grains & bread'
  | 'Beans & legumes'
  | 'Vegetables'
  | 'Fruit'
  | 'Fats, nuts & seeds'
  | 'Sauces, sweeteners & extras'

type Row = [
  id: string,
  name: string,
  group: FoodGroup,
  aliases: string[],
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  sizes?: { cupG?: number; pieceG?: number; canG?: number },
]

const MEAT: FoodGroup = 'Meat, fish & eggs'
const DAIRY: FoodGroup = 'Dairy & protein'
const GRAIN: FoodGroup = 'Grains & bread'
const BEAN: FoodGroup = 'Beans & legumes'
const VEG: FoodGroup = 'Vegetables'
const FRUIT: FoodGroup = 'Fruit'
const FAT: FoodGroup = 'Fats, nuts & seeds'
const EXTRA: FoodGroup = 'Sauces, sweeteners & extras'

const ROWS: Row[] = [
  // Meat, fish & eggs (raw unless noted)
  ['chicken-breast', 'Chicken breast, raw', MEAT, ['chicken breast', 'chicken', 'chicken cutlet', 'chicken tenders'], 120, 22.5, 0, 2.6, { pieceG: 200 }],
  ['chicken-thigh', 'Chicken thigh, boneless skinless, raw', MEAT, ['chicken thigh'], 121, 19.7, 0, 4.1, { pieceG: 110 }],
  ['chicken-cooked', 'Chicken, cooked', MEAT, ['cooked chicken', 'rotisserie chicken', 'shredded chicken', 'grilled chicken'], 165, 31, 0, 3.6, { cupG: 140 }],
  ['ground-chicken', 'Ground chicken, raw', MEAT, ['ground chicken'], 143, 17.4, 0, 8.1],
  ['ground-turkey', 'Ground turkey 93% lean, raw', MEAT, ['ground turkey', 'turkey'], 150, 18.7, 0, 8.3],
  ['turkey-breast', 'Turkey breast deli slices', MEAT, ['deli turkey', 'turkey breast', 'sliced turkey'], 104, 17, 4, 1.7, { pieceG: 28 }],
  ['ground-beef', 'Ground beef 90% lean, raw', MEAT, ['ground beef', 'beef', 'hamburger'], 176, 20, 0, 10],
  ['steak', 'Sirloin steak, raw', MEAT, ['steak', 'sirloin', 'flank steak', 'skirt steak'], 143, 22, 0, 5.5, { pieceG: 225 }],
  ['pork-loin', 'Pork loin / chop, raw', MEAT, ['pork', 'pork loin', 'pork chop', 'pork tenderloin'], 143, 21, 0, 6, { pieceG: 170 }],
  ['bacon', 'Bacon, raw', MEAT, ['bacon'], 417, 13, 1.4, 40, { pieceG: 28 }],
  ['salmon', 'Salmon, raw', MEAT, ['salmon'], 208, 20, 0, 13.4, { pieceG: 150 }],
  ['white-fish', 'White fish (cod, tilapia), raw', MEAT, ['cod', 'tilapia', 'white fish', 'halibut', 'fish'], 85, 18.5, 0, 1, { pieceG: 150 }],
  ['shrimp', 'Shrimp, raw', MEAT, ['shrimp', 'prawns'], 85, 20, 0, 0.5],
  ['tuna-can', 'Tuna in water, drained', MEAT, ['tuna'], 116, 25.5, 0, 0.8, { canG: 120 }],
  ['egg', 'Egg, large', MEAT, ['egg'], 143, 12.6, 0.7, 9.5, { pieceG: 50 }],
  ['egg-white', 'Egg whites', MEAT, ['egg white', 'liquid egg white'], 52, 10.9, 0.7, 0.2, { cupG: 243, pieceG: 33 }],
  ['tofu', 'Tofu, firm', MEAT, ['tofu'], 144, 17.3, 2.8, 8.7, { pieceG: 400 }],

  // Dairy & protein
  ['protein-powder', 'Protein powder (whey), 1 scoop = 30 g', DAIRY, ['protein powder', 'whey', 'protein'], 400, 80, 8, 6, { pieceG: 30, cupG: 120 }],
  ['greek-yogurt', 'Greek yogurt, nonfat plain', DAIRY, ['greek yogurt', 'yogurt'], 59, 10.3, 3.6, 0.4, { cupG: 245 }],
  ['cottage-cheese', 'Cottage cheese, 2%', DAIRY, ['cottage cheese'], 81, 10.5, 4.8, 2.3, { cupG: 226 }],
  ['milk', 'Milk, 2%', DAIRY, ['milk'], 50, 3.3, 4.8, 2, { cupG: 244 }],
  ['almond-milk', 'Almond milk, unsweetened', DAIRY, ['almond milk', 'oat milk', 'soy milk', 'plant milk'], 15, 0.6, 0.3, 1.2, { cupG: 240 }],
  ['cheddar', 'Cheddar / shredded cheese', DAIRY, ['cheddar', 'cheese', 'shredded cheese', 'mexican cheese', 'monterey jack'], 403, 23, 3.1, 33, { cupG: 113, pieceG: 28 }],
  ['mozzarella', 'Mozzarella, part-skim', DAIRY, ['mozzarella'], 254, 24, 2.8, 16, { cupG: 112, pieceG: 28 }],
  ['feta', 'Feta, crumbled', DAIRY, ['feta'], 265, 14, 4, 21, { cupG: 150 }],
  ['cotija', 'Cotija, crumbled', DAIRY, ['cotija', 'queso fresco'], 366, 20, 4, 30, { cupG: 120 }],
  ['parmesan', 'Parmesan, grated', DAIRY, ['parmesan', 'parmigiano'], 420, 29, 14, 28, { cupG: 100 }],
  ['cream-cheese', 'Cream cheese', DAIRY, ['cream cheese'], 342, 6, 4, 34, { cupG: 232 }],
  ['sour-cream', 'Sour cream', DAIRY, ['sour cream'], 198, 2.4, 4.6, 19, { cupG: 230 }],

  // Grains & bread (dry/uncooked unless noted)
  ['oats', 'Rolled oats, dry', GRAIN, ['oats', 'rolled oats', 'oatmeal', 'quick oats'], 379, 13.2, 67.7, 6.5, { cupG: 81 }],
  ['rice-dry', 'White rice, dry', GRAIN, ['rice', 'white rice', 'jasmine rice', 'basmati rice'], 365, 7.1, 80, 0.7, { cupG: 185 }],
  ['rice-cooked', 'White rice, cooked', GRAIN, ['cooked rice', 'cooked white rice'], 130, 2.7, 28.2, 0.3, { cupG: 158 }],
  ['brown-rice-dry', 'Brown rice, dry', GRAIN, ['brown rice'], 370, 7.9, 77, 2.9, { cupG: 190 }],
  ['brown-rice-cooked', 'Brown rice, cooked', GRAIN, ['cooked brown rice'], 123, 2.7, 25.6, 1, { cupG: 195 }],
  ['quinoa-dry', 'Quinoa, dry', GRAIN, ['quinoa'], 368, 14.1, 64.2, 6.1, { cupG: 170 }],
  ['quinoa-cooked', 'Quinoa, cooked', GRAIN, ['cooked quinoa'], 120, 4.4, 21.3, 1.9, { cupG: 185 }],
  ['pasta-dry', 'Pasta, dry', GRAIN, ['pasta', 'spaghetti', 'penne', 'macaroni', 'noodles', 'linguine', 'fettuccine', 'rotini'], 371, 13, 75, 1.5, { cupG: 100 }],
  ['pasta-cooked', 'Pasta, cooked', GRAIN, ['cooked pasta'], 158, 5.8, 31, 0.9, { cupG: 140 }],
  ['bread', 'Bread, whole wheat (1 slice = 32 g)', GRAIN, ['bread', 'toast'], 252, 12.4, 43, 3.5, { pieceG: 32 }],
  ['flour', 'Flour, all-purpose', GRAIN, ['flour', 'all purpose flour', 'whole wheat flour'], 364, 10.3, 76, 1, { cupG: 125 }],
  ['oat-flour', 'Oat flour', GRAIN, ['oat flour'], 404, 14.7, 65.7, 9.1, { cupG: 104 }],
  ['breadcrumbs', 'Breadcrumbs', GRAIN, ['breadcrumbs', 'bread crumbs', 'panko'], 395, 13.4, 72, 5.3, { cupG: 108 }],
  ['corn-tortilla', 'Corn tortilla, small (26 g)', GRAIN, ['corn tortilla'], 218, 5.7, 44.6, 2.9, { pieceG: 26 }],
  ['flour-tortilla', 'Flour tortilla, 8 inch (49 g)', GRAIN, ['flour tortilla', 'tortilla', 'wrap'], 312, 8.3, 51.6, 8, { pieceG: 49 }],
  ['ww-tortilla', 'Whole-wheat tortilla, large (60 g)', GRAIN, ['whole wheat tortilla', 'wheat tortilla'], 290, 9.5, 46, 7.5, { pieceG: 60 }],
  ['protein-tortilla', 'High-protein tortilla (45 g)', GRAIN, ['protein tortilla', 'high protein tortilla', 'low carb tortilla'], 155, 13, 38, 6.5, { pieceG: 45 }],
  ['bagel', 'Bagel (105 g)', GRAIN, ['bagel'], 257, 10, 50.5, 1.6, { pieceG: 105 }],
  ['granola', 'Granola', GRAIN, ['granola'], 471, 10, 64, 20, { cupG: 122 }],

  // Beans & legumes (cooked / canned drained)
  ['black-beans', 'Black beans, canned drained', BEAN, ['black beans', 'beans'], 132, 8.9, 23.7, 0.5, { cupG: 172, canG: 255 }],
  ['kidney-beans', 'Kidney beans, canned drained', BEAN, ['kidney beans', 'pinto beans', 'red beans'], 127, 8.7, 22.8, 0.5, { cupG: 177, canG: 255 }],
  ['chickpeas', 'Chickpeas, canned drained', BEAN, ['chickpeas', 'garbanzo beans', 'garbanzo'], 164, 8.9, 27.4, 2.6, { cupG: 164, canG: 240 }],
  ['lentils-cooked', 'Lentils, cooked', BEAN, ['cooked lentils'], 116, 9, 20, 0.4, { cupG: 198 }],
  ['lentils-dry', 'Lentils, dry', BEAN, ['lentils', 'red lentils', 'dry lentils'], 352, 24.6, 63, 1.1, { cupG: 192 }],
  ['edamame', 'Edamame, shelled', BEAN, ['edamame'], 121, 11.9, 8.9, 5.2, { cupG: 155 }],
  ['hummus', 'Hummus', BEAN, ['hummus'], 166, 7.9, 14.3, 9.6, { cupG: 246 }],

  // Vegetables (raw)
  ['sweet-potato', 'Sweet potato (medium 130 g)', VEG, ['sweet potato', 'yam'], 86, 1.6, 20.1, 0.1, { pieceG: 130, cupG: 133 }],
  ['potato', 'Potato (medium 213 g)', VEG, ['potato', 'baby potato', 'russet', 'yukon gold'], 77, 2, 17.5, 0.1, { pieceG: 213, cupG: 150 }],
  ['broccoli', 'Broccoli', VEG, ['broccoli', 'broccoli florets'], 34, 2.8, 6.6, 0.4, { cupG: 91, pieceG: 225 }],
  ['cauliflower', 'Cauliflower / cauliflower rice', VEG, ['cauliflower', 'cauliflower rice'], 25, 1.9, 5, 0.3, { cupG: 107, pieceG: 575 }],
  ['spinach', 'Spinach', VEG, ['spinach', 'baby spinach', 'kale'], 23, 2.9, 3.6, 0.4, { cupG: 30 }],
  ['lettuce', 'Lettuce / romaine / mixed greens', VEG, ['lettuce', 'romaine', 'mixed greens', 'salad greens', 'arugula'], 17, 1.2, 3.3, 0.3, { cupG: 47, pieceG: 600 }],
  ['cabbage', 'Cabbage / slaw mix', VEG, ['cabbage', 'coleslaw mix', 'slaw'], 25, 1.3, 5.8, 0.1, { cupG: 70 }],
  ['onion', 'Onion (medium 110 g)', VEG, ['onion', 'red onion', 'yellow onion', 'shallot'], 40, 1.1, 9.3, 0.1, { pieceG: 110, cupG: 160 }],
  ['green-onion', 'Green onion', VEG, ['green onion', 'scallion', 'spring onion'], 32, 1.8, 7.3, 0.2, { pieceG: 15, cupG: 100 }],
  ['garlic', 'Garlic (1 clove = 3 g)', VEG, ['garlic'], 149, 6.4, 33, 0.5, { pieceG: 3, cupG: 136 }],
  ['bell-pepper', 'Bell pepper (120 g)', VEG, ['bell pepper', 'red pepper', 'green pepper', 'yellow pepper'], 31, 1, 6, 0.3, { pieceG: 120, cupG: 150 }],
  ['jalapeno', 'Jalapeño', VEG, ['jalapeno', 'chili pepper', 'chile'], 29, 0.9, 6.5, 0.4, { pieceG: 14 }],
  ['tomato', 'Tomato (medium 123 g)', VEG, ['tomato', 'cherry tomato', 'roma tomato'], 18, 0.9, 3.9, 0.2, { pieceG: 123, cupG: 180 }],
  ['tomato-can', 'Tomatoes, canned (crushed or diced)', VEG, ['crushed tomatoes', 'diced tomatoes', 'canned tomatoes', 'tomato sauce', 'marinara', 'pasta sauce'], 32, 1.6, 7.3, 0.3, { cupG: 245, canG: 400 }],
  ['tomato-paste', 'Tomato paste', VEG, ['tomato paste'], 82, 4.3, 18.9, 0.5, { cupG: 262 }],
  ['carrot', 'Carrot (medium 61 g)', VEG, ['carrot'], 41, 0.9, 9.6, 0.2, { pieceG: 61, cupG: 128 }],
  ['cucumber', 'Cucumber (300 g)', VEG, ['cucumber'], 15, 0.7, 3.6, 0.1, { pieceG: 300, cupG: 120 }],
  ['zucchini', 'Zucchini (200 g)', VEG, ['zucchini', 'squash'], 17, 1.2, 3.1, 0.3, { pieceG: 200, cupG: 124 }],
  ['mushrooms', 'Mushrooms', VEG, ['mushroom'], 22, 3.1, 3.3, 0.3, { cupG: 70, pieceG: 18 }],
  ['asparagus', 'Asparagus (1 bunch = 450 g)', VEG, ['asparagus'], 20, 2.2, 3.9, 0.1, { pieceG: 450, cupG: 134 }],
  ['green-beans', 'Green beans', VEG, ['green beans', 'string beans'], 31, 1.8, 7, 0.2, { cupG: 110 }],
  ['corn', 'Corn kernels', VEG, ['corn'], 86, 3.3, 19, 1.4, { cupG: 145, canG: 250 }],
  ['peas', 'Green peas', VEG, ['peas'], 81, 5.4, 14.5, 0.4, { cupG: 145 }],
  ['celery', 'Celery', VEG, ['celery'], 14, 0.7, 3, 0.2, { pieceG: 40, cupG: 101 }],
  ['herbs', 'Fresh herbs (cilantro, parsley, dill...)', VEG, ['cilantro', 'parsley', 'dill', 'basil', 'mint', 'herbs', 'fresh herbs'], 23, 2.1, 3.7, 0.5, { cupG: 16, pieceG: 50 }],
  ['ginger', 'Ginger, fresh', VEG, ['ginger'], 80, 1.8, 18, 0.8, { cupG: 96, pieceG: 15 }],

  // Fruit
  ['banana', 'Banana (medium 118 g)', FRUIT, ['banana'], 89, 1.1, 22.8, 0.3, { pieceG: 118, cupG: 150 }],
  ['apple', 'Apple (medium 182 g)', FRUIT, ['apple'], 52, 0.3, 13.8, 0.2, { pieceG: 182, cupG: 125 }],
  ['berries', 'Berries (blueberries, mixed)', FRUIT, ['berries', 'blueberries', 'mixed berries', 'raspberries', 'blackberries'], 57, 0.7, 14.5, 0.3, { cupG: 148 }],
  ['strawberries', 'Strawberries', FRUIT, ['strawberries', 'strawberry'], 32, 0.7, 7.7, 0.3, { cupG: 152, pieceG: 12 }],
  ['lemon', 'Lemon or lime juice (1 fruit = 45 g juice)', FRUIT, ['lemon', 'lime', 'lemon juice', 'lime juice'], 22, 0.4, 6.9, 0.2, { pieceG: 45, cupG: 244 }],
  ['orange', 'Orange (medium 140 g)', FRUIT, ['orange'], 47, 0.9, 11.8, 0.1, { pieceG: 140 }],
  ['mango', 'Mango', FRUIT, ['mango'], 60, 0.8, 15, 0.4, { cupG: 165, pieceG: 200 }],
  ['pineapple', 'Pineapple', FRUIT, ['pineapple'], 50, 0.5, 13.1, 0.1, { cupG: 165 }],
  ['raisins', 'Raisins / dried fruit', FRUIT, ['raisins', 'dried cranberries', 'dates', 'dried fruit'], 299, 3.1, 79, 0.5, { cupG: 145 }],

  // Fats, nuts & seeds
  ['olive-oil', 'Oil (olive, avocado, vegetable...)', FAT, ['oil', 'olive oil', 'avocado oil', 'vegetable oil', 'canola oil', 'coconut oil', 'sesame oil', 'cooking spray'], 884, 0, 0, 100, { cupG: 216 }],
  ['butter', 'Butter', FAT, ['butter', 'ghee'], 717, 0.9, 0.1, 81, { cupG: 227 }],
  ['avocado', 'Avocado (150 g)', FAT, ['avocado', 'guacamole'], 160, 2, 8.5, 14.7, { pieceG: 150, cupG: 230 }],
  ['peanut-butter', 'Peanut butter', FAT, ['peanut butter', 'almond butter', 'nut butter'], 588, 25, 20, 50, { cupG: 258 }],
  ['pb-powder', 'Powdered peanut butter', FAT, ['powdered peanut butter', 'pb2'], 400, 47, 33, 13, { cupG: 96 }],
  ['almonds', 'Almonds / mixed nuts', FAT, ['almonds', 'nuts', 'walnuts', 'pecans', 'cashews', 'peanuts', 'mixed nuts'], 579, 21, 21.6, 49.9, { cupG: 143 }],
  ['chia', 'Chia seeds', FAT, ['chia', 'chia seeds'], 486, 16.5, 42, 30.7, { cupG: 192 }],
  ['flax', 'Ground flaxseed', FAT, ['flax', 'flaxseed', 'ground flaxseed', 'flax seed'], 534, 18.3, 28.9, 42.2, { cupG: 112 }],
  ['seeds', 'Seeds (pumpkin, sunflower, hemp)', FAT, ['pumpkin seeds', 'sunflower seeds', 'hemp seeds', 'pepitas', 'seeds'], 570, 27, 15, 47, { cupG: 130 }],
  ['tahini', 'Tahini', FAT, ['tahini'], 595, 17, 21, 53.8, { cupG: 240 }],
  ['coconut-milk', 'Coconut milk, canned full-fat', FAT, ['coconut milk'], 197, 2, 2.8, 21.3, { cupG: 240, canG: 400 }],
  ['coconut-milk-light', 'Coconut milk, canned light', FAT, ['light coconut milk'], 62, 0.6, 2.8, 5.8, { cupG: 240, canG: 400 }],
  ['mayo', 'Mayonnaise', FAT, ['mayo', 'mayonnaise'], 680, 1, 0.6, 75, { cupG: 220 }],
  ['chocolate-chips', 'Dark chocolate chips', FAT, ['chocolate chips', 'chocolate', 'dark chocolate'], 480, 4.2, 63, 30, { cupG: 168 }],

  // Sauces, sweeteners & extras
  ['honey', 'Honey', EXTRA, ['honey'], 304, 0.3, 82.4, 0, { cupG: 340 }],
  ['maple-syrup', 'Maple syrup', EXTRA, ['maple syrup', 'syrup', 'agave'], 260, 0, 67, 0.1, { cupG: 315 }],
  ['sugar', 'Sugar', EXTRA, ['sugar', 'brown sugar', 'coconut sugar'], 387, 0, 100, 0, { cupG: 200 }],
  ['cocoa', 'Cocoa powder', EXTRA, ['cocoa', 'cocoa powder', 'cacao'], 228, 19.6, 57.9, 13.7, { cupG: 86 }],
  ['salsa', 'Salsa / pico de gallo', EXTRA, ['salsa', 'pico de gallo', 'pico'], 36, 1.5, 7, 0.2, { cupG: 260 }],
  ['soy-sauce', 'Soy sauce', EXTRA, ['soy sauce', 'tamari', 'coconut aminos'], 53, 8.1, 4.9, 0.6, { cupG: 255 }],
  ['bbq-sauce', 'BBQ / teriyaki sauce', EXTRA, ['bbq sauce', 'barbecue sauce', 'teriyaki', 'ketchup', 'sweet chili sauce'], 172, 0.8, 41, 0.6, { cupG: 285 }],
  ['broth', 'Broth / stock', EXTRA, ['broth', 'stock', 'bouillon', 'chicken broth', 'chicken stock', 'beef broth', 'vegetable broth', 'bone broth'], 5, 0.6, 0.4, 0.2, { cupG: 240 }],
  ['spices', 'Dried spices & seasonings', EXTRA, ['paprika', 'smoked paprika', 'cumin', 'chili powder', 'oregano', 'cinnamon', 'garlic powder', 'onion powder', 'curry powder', 'seasoning', 'italian seasoning', 'taco seasoning', 'thyme', 'rosemary', 'turmeric', 'red pepper flakes', 'cayenne', 'vanilla', 'vanilla extract', 'baking powder', 'baking soda', 'nutmeg'], 300, 12, 55, 10, { cupG: 96 }],
  ['zero', 'Salt, pepper, water, vinegar, hot sauce (0 cal)', EXTRA, ['salt', 'pepper', 'black pepper', 'water', 'ice', 'vinegar', 'hot sauce', 'mustard'], 0, 0, 0, 0, { cupG: 240, pieceG: 1 }],
]

export const FOODS: Food[] = ROWS.map(([id, name, group, aliases, calories, protein, carbs, fat, sizes]) => ({
  id,
  name,
  group,
  aliases,
  per100g: { calories, protein, carbs, fat },
  ...sizes,
}))

export const FOOD_BY_ID = new Map(FOODS.map((f) => [f.id, f]))

export const FOOD_GROUPS: FoodGroup[] = [MEAT, DAIRY, GRAIN, BEAN, VEG, FRUIT, FAT, EXTRA]
