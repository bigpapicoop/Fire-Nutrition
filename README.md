# Fire Nutrition

Macro-friendly recipes with servings you can scale, a nutrition calculator, favorites, and your own recipes.
It's an installable web app (PWA): put it online once, then add it to your phone's home screen.
It opens full-screen and works offline.

## Run it on your computer

```powershell
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173). The page updates the moment you save a file.
To watch changes live on your phone too (same Wi-Fi), run `npx vite --host` and open the "Network" address it prints.

## Automatic publishing (GitHub + Netlify)

Once this is set up, every change you push goes live on its own in about a minute. No building or dragging folders.

### One-time setup

1. **GitHub:** sign up at https://github.com, then click **+ → New repository**.
   Name it (e.g. `fire-nutrition`), leave everything else unticked (no README, no .gitignore), and click **Create repository**.
2. **Push this project to it.** In PowerShell, in this folder, run these, using your repository's address from GitHub:

   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/fire-nutrition.git
   git push -u origin main
   ```

   The first push opens a GitHub sign-in window. Sign in there.
3. **Netlify:** sign in at https://app.netlify.com.
   - **Already have a site from dragging a folder?** Open it → **Site configuration → Build & deploy → Continuous deployment → Link repository** → GitHub → pick `fire-nutrition`. Your link stays the same.
   - **Starting fresh?** **Add new site → Import an existing project → GitHub** → pick `fire-nutrition` → **Deploy**.

   Netlify reads the build settings from `netlify.toml`, so there's nothing else to fill in.

### Publishing a change

```powershell
npm run ship
```

That saves all your changes and pushes them to GitHub. Netlify picks them up and publishes in about a minute.
Watch it under **Deploys** in Netlify. If an update breaks something, open an older deploy there and click **Publish deploy** to roll back.

## How phones get updates

The app checks for a new version when it opens, when you switch back to it, and every 5 minutes while it's open.
When there is one, a **"A new version of Fire Nutrition is available. Update now"** bar appears at the top. Tap it to load the update.

## Install it on your phone

Open your link on the phone, then:

- **iPhone (Safari):** tap **Share** → **Add to Home Screen** → **Add**.
- **Android (Chrome):** tap **Install app** in the app's top bar, or ⋮ → **Add to Home screen** / **Install app**.

Open the app once while you're online. After that it works without internet.

Anyone with the link can open the site. Recipes you add and your favorites are not uploaded: they stay on each device.

## Where things live

- `src/data/recipes.ts`: the built-in recipes
- `src/nutrition/foods.ts`: the food list the nutrition calculator uses (per 100 g)
- `src/components/`: recipe card, recipe page, add-recipe form, calculator, install and update bars
- `public/manifest.webmanifest`: app name, colors and icons for the home screen
- `public/sw.js`: offline support
- `netlify.toml`: how Netlify builds and serves the site
- `branding/logo-original.webp`: the original Fire Nutrition logo
- `scripts/make-icons.mjs`: rebuilds the home-screen icons and header logo from that file (`npm run icons`).
  After changing them, bump `VERSION` in `public/sw.js` so installed apps update.
