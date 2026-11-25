# Fire Nutrition

Macro-friendly recipes with servings you can scale, a nutrition calculator, favorites, and your own recipes.
It's an installable web app (PWA): add it to your phone's home screen and it opens full-screen and works offline.

**Live app:** https://bigpapicoop.github.io/Fire-Nutrition/
**Code:** https://github.com/bigpapicoop/Fire-Nutrition

## Run it on your computer

```powershell
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173). The page updates the moment you save a file.
To watch changes live on your phone too (same Wi-Fi), run `npx vite --host` and open the "Network" address it prints.

## Publishing updates

Run this in this folder:

```powershell
npm run ship
```

It checks that the app builds, then saves your changes to GitHub. GitHub builds and publishes the app automatically,
live in about a minute. Add a note if you like: `npm run ship -- "Added turkey chili"`.

Watch each publish at https://github.com/bigpapicoop/Fire-Nutrition/actions (green check = live, red X = failed;
the live app stays on the last good version if one fails). The automation is in `.github/workflows/deploy.yml`.

## How phones get updates

The app checks for a new version when it opens, when you switch back to it, and every 5 minutes while it's open.
When there is one, a **"A new version of Fire Nutrition is available. Update now"** bar appears at the top. Tap it to load the update.

## Install it on your phone

Open the live link on the phone, then:

- **iPhone (Safari):** tap **Share** → **Add to Home Screen** → **Add**.
- **Android (Chrome):** tap **Install app** in the app's top bar, or ⋮ → **Add to Home screen** / **Install app**.

Open the app once while you're online. After that it works without internet.

The code is public on GitHub, and anyone with the link can open the app. Recipes you add and your favorites
are not uploaded: they stay on each device.

## Where things live

- `src/data/recipes.ts`: the built-in recipes
- `src/nutrition/foods.ts`: the food list the nutrition calculator uses (per 100 g)
- `src/components/`: recipe card, recipe page, add-recipe form, calculator, install and update bars
- `public/manifest.webmanifest`: app name, colors and icons for the home screen
- `public/sw.js`: offline support
- `scripts/ship.mjs`: what `npm run ship` does
- `.github/workflows/deploy.yml`: how GitHub builds and publishes the app
- `netlify.toml`: settings for Netlify, if you ever host it there instead
- `branding/logo-original.webp`: the original Fire Nutrition logo
- `scripts/make-icons.mjs`: rebuilds the home-screen icons and header logo from that file (`npm run icons`).
  After changing them, bump `VERSION` in `public/sw.js` so installed apps update.
