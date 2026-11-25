// Builds the app icons and the header logo from branding/logo-original.webp.
// Run with: node scripts/make-icons.mjs
//
// The original logo is a red flame above white "FIRE NUTRITION" lettering on a transparent background.
// Small icons use only the flame (the lettering is unreadable at home-screen size),
// on a near-black square so the white-on-dark brand look carries over.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const SOURCE = fileURLToPath(new URL('../branding/logo-original.webp', import.meta.url))
const OUT = fileURLToPath(new URL('../public/', import.meta.url))

// Where the flame sits in the original 1536 x 1024 image (found by scanning for red pixels), plus a little margin.
const FLAME = { left: 620, top: 110, width: 292, height: 358 }
const ICON_BG = { r: 17, g: 17, b: 17, alpha: 1 } // #111111
const FLAME_HEIGHT_RATIO = 0.58 // flame height as a share of the icon (keeps it inside Android's round crop)

// Two steps: sharp would otherwise trim the whole image before cutting out the flame.
const cropped = await sharp(SOURCE).extract(FLAME).png().toBuffer()
const flame = await sharp(cropped).trim({ threshold: 10 }).png().toBuffer()

async function icon(size, file) {
  const h = Math.round(size * FLAME_HEIGHT_RATIO)
  const mark = await sharp(flame).resize({ height: h }).toBuffer()
  const { width = 0 } = await sharp(mark).metadata()
  await sharp({ create: { width: size, height: size, channels: 4, background: ICON_BG } })
    .composite([{ input: mark, left: Math.round((size - width) / 2), top: Math.round((size - h) / 2) }])
    .flatten({ background: ICON_BG })
    .png()
    .toFile(join(OUT, file))
  console.log(`wrote public/${file} (${size}x${size})`)
}

mkdirSync(join(OUT, 'icons'), { recursive: true })
await icon(512, 'icons/icon-512.png')
await icon(192, 'icons/icon-192.png')
await icon(180, 'icons/apple-touch-icon.png')
await icon(64, 'icons/favicon-64.png')

// Header logo: just the flame, transparent, 3x the size it's shown at for sharp phone screens.
await sharp(flame).resize({ height: 96 }).png().toFile(join(OUT, 'logo-mark.png'))
console.log('wrote public/logo-mark.png')
