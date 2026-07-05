// Einmaliges Hilfsskript: erzeugt PWA-PNG-Icons (192/512/maskable) aus dem SVG-Quellicon.
// Wird nach `npm run build` nicht mehr benötigt; Icons sind danach statisch unter /public.
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svg = readFileSync(resolve(root, 'public/pwa-icon.svg'))

// Normales Icon: volles SVG, rundungs-Maske bereits enthalten
await sharp(svg).resize(192, 192).png().toFile(resolve(root, 'public/pwa-icon-192.png'))
await sharp(svg).resize(512, 512).png().toFile(resolve(root, 'public/pwa-icon-512.png'))

// Maskable-Icon: zusätzlicher Safe-Area-Padding (weißer Hintergrund), damit
// Android das Icon nicht zu stark beschneidet. Wir zeichnen das SVG auf ein
// 80%-Inset innerhalb eines weißen 512x512-Hintergrunds.
const maskableBg = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#0c7fa8"/></svg>',
)
const inner = await sharp(svg).resize(410, 410).png().toBuffer()
await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#0c7fa8' },
})
  .composite([{ input: inner, gravity: 'center' }])
  .png()
  .toFile(resolve(root, 'public/pwa-icon-512-maskable.png'))

console.log('✓ PWA-Icons generiert (192, 512, 512-maskable)')
