// Génère des fixtures JSON réalistes, dans la forme exacte des réponses
// WP REST attendues (voir "Ava du Parc.md" section 6 — Fetch centralisé).
// Régénérer : npm run generate:mock

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../src/mocks/fixtures')

const TOTAL_IMAGES = 200
const PAGE_CATS = ['portraits', 'making-of', 'interieurs', 'reportage']
const COLOR_TAGS = ['blanc', 'rouge', 'vert', 'bleu', 'jaune', 'magenta', 'cyan', 'noir']

// PRNG seedé pour des fixtures reproductibles (pas de diff git à chaque régénération)
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260324)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]

function buildImage(id) {
  const primaryCat = pick(PAGE_CATS)
  const page_cat = [primaryCat]
  if (rand() < 0.15) {
    const second = pick(PAGE_CATS.filter((c) => c !== primaryCat))
    page_cat.push(second)
  }

  const daysAgo = Math.floor(rand() * 730)
  const date = new Date(Date.now() - daysAgo * 86400000).toISOString()

  const seed = `ava-${id}`
  return {
    id,
    date,
    source_url: `https://picsum.photos/seed/${seed}/2400/2400`,
    media_details: {
      width: 2400,
      height: 2400,
      sizes: {
        thumbnail: { source_url: `https://picsum.photos/seed/${seed}/300/300`, width: 300, height: 300 },
        grid: { source_url: `https://picsum.photos/seed/${seed}/800/800`, width: 800, height: 800 },
        lightbox: { source_url: `https://picsum.photos/seed/${seed}/1600/1600`, width: 1600, height: 1600 },
      },
    },
    color_tag: [pick(COLOR_TAGS)],
    page_cat,
  }
}

const images = Array.from({ length: TOTAL_IMAGES }, (_, i) => buildImage(i + 1))

const pages = [
  {
    slug: 'accueil',
    template: 'home',
    title: { rendered: 'Accueil' },
    content: { rendered: '<p>Bloc actualité — mis à jour ~1x/an par le client.</p>' },
  },
  {
    slug: 'portraits',
    template: 'gallery-floating',
    title: { rendered: 'Portraits' },
    content: { rendered: '<p>Série portraits.</p>' },
  },
  {
    slug: 'making-of',
    template: 'gallery-floating',
    title: { rendered: 'Making-of' },
    content: { rendered: '<p>Coulisses des shootings.</p>' },
  },
  {
    slug: 'interieurs',
    template: 'gallery-floating',
    title: { rendered: 'Intérieurs' },
    content: { rendered: '<p>Photographie d’intérieurs.</p>' },
  },
  {
    slug: 'reportage',
    template: 'gallery-floating',
    title: { rendered: 'Reportage' },
    content: { rendered: '<p>Reportages.</p>' },
  },
  {
    slug: 'colors',
    template: 'gallery-colors',
    title: { rendered: 'Colors' },
    content: { rendered: '' },
  },
  {
    slug: 'a-propos',
    template: 'about',
    title: { rendered: 'À propos' },
    content: { rendered: '<p>Bio, coordonnées, CV.</p>' },
  },
]

writeFileSync(join(OUT_DIR, 'images.json'), JSON.stringify(images, null, 2) + '\n')
writeFileSync(join(OUT_DIR, 'pages.json'), JSON.stringify(pages, null, 2) + '\n')

console.log(`✓ ${images.length} images -> src/mocks/fixtures/images.json`)
console.log(`✓ ${pages.length} pages -> src/mocks/fixtures/pages.json`)
