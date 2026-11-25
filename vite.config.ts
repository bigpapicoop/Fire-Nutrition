import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative paths, so the built app works from any host or sub-folder (e.g. GitHub Pages).
  base: './',
})
