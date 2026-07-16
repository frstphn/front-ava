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

// Ratios d'aspect variés — de vraies photos ne sont pas toutes carrées, indispensable
// pour tester le placement flottant (GalleryFloating) avec des proportions réalistes.
const ASPECT_RATIOS = [
  { w: 1, h: 1 }, // carré
  { w: 4, h: 5 }, // portrait Instagram
  { w: 3, h: 4 }, // portrait classique
  { w: 2, h: 3 }, // portrait 35mm
  { w: 4, h: 3 }, // paysage classique
  { w: 3, h: 2 }, // paysage 35mm
  { w: 16, h: 9 }, // paysage large
]

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
  const ratio = pick(ASPECT_RATIOS)
  const portrait = ratio.h > ratio.w
  // Dimensions pour un côté long donné, en respectant le ratio et en alternant
  // aléatoirement l'orientation (portrait/paysage) même pour les ratios non carrés.
  const flip = !portrait && rand() < 0.5
  const dims = (longSide) => {
    const [rw, rh] = flip ? [ratio.h, ratio.w] : [ratio.w, ratio.h]
    return rw >= rh
      ? { width: longSide, height: Math.round((longSide * rh) / rw) }
      : { width: Math.round((longSide * rw) / rh), height: longSide }
  }

  const full = dims(2400)
  const grid = dims(800)
  const lightbox = dims(1600)
  const thumb = dims(300)

  return {
    id,
    date,
    source_url: `https://picsum.photos/seed/${seed}/${full.width}/${full.height}`,
    media_details: {
      width: full.width,
      height: full.height,
      sizes: {
        thumbnail: { source_url: `https://picsum.photos/seed/${seed}/${thumb.width}/${thumb.height}`, ...thumb },
        grid: { source_url: `https://picsum.photos/seed/${seed}/${grid.width}/${grid.height}`, ...grid },
        lightbox: {
          source_url: `https://picsum.photos/seed/${seed}/${lightbox.width}/${lightbox.height}`,
          ...lightbox,
        },
      },
    },
    color_tag: [pick(COLOR_TAGS)],
    page_cat,
  }
}

const images = Array.from({ length: TOTAL_IMAGES }, (_, i) => buildImage(i + 1))

// Contenu réel repéré dans "20260324-Site Ava.pdf" (bloc actualité "Supernova",
// CV complet de la page À propos) — réutilisé tel quel plutôt qu'un placeholder.
const ABOUT_CV_HTML = `
  <section>
    <h3>Expositions personnelles et collectives</h3>
    <p>2025 – Supernova, Cadre en Seine, Paris<br>2020 – NNIPAS, Grands Thermes, La Bourboule<br>2018 – NNIPAS, Sainte-Marie-aux-Mines</p>
  </section>
  <section>
    <h3>Prix</h3>
    <p>2025, Finaliste Prix Herez<br>2014, Prix Lidl</p>
  </section>
  <section>
    <h3>Edition</h3>
    <p>2019 – Les Contemplations, auto-édition<br>2011-2013 – Novarupta, revue collective</p>
  </section>
  <section>
    <h3>Publications</h3>
    <p>Libération, Le Monde, Nez, Omnivore, Fracas, Turbulences Presse</p>
  </section>
  <section>
    <h3>Cartes blanches</h3>
    <p>2024 – Hermès, Faubourama, Extraversions photographiques<br>2025 – Maison Luzi, 50 ans<br>2018-2025 – Galerie Kraemer<br>2023-2025 – Nike<br>2020-2022 – We Love Green</p>
  </section>
  <section>
    <h3>Commandes</h3>
    <p>Hermès, L'Oréal, Orchestre d'Auvergne, Nuits de Fourvières, Philharmonie de Paris, Fauchon, Chanel, La Bourse de Commerce, L'Académie du Climat, AG2R La Mondiale, Grand Optical…</p>
  </section>
  <section>
    <h3>Formations</h3>
    <p>2013 : diplômée du Master en Photographie à l'ENS Louis Lumière</p>
  </section>
`.trim()

const pages = [
  {
    slug: 'accueil',
    template: 'home',
    title: { rendered: 'Supernova' },
    content: {
      rendered:
        "<p>À la suite de la naissance de son premier enfant survenu dans des circonstances difficiles, la photographe Ava du Parc cherche à conjurer cet épisode traumatique. Dans l'intimité de cette nouvelle vie, elle enregistre les éléments qui la composent – des autoportraits, des lumières passagères, la nature qui l'entoure, les êtres aimés – pour se réapproprier son corps, saisir le temps qui passe et qui répare. Comme une supernova, cette explosion lumineuse qui marque la fin de vie d'une étoile, la photographe nous invite.</p>",
    },
    featured_image_url: 'https://picsum.photos/seed/ava-actuality/1200/800',
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
    content: { rendered: ABOUT_CV_HTML },
    featured_image_url: 'https://picsum.photos/seed/ava-portrait/600/750',
    contact_phone: '06 17 68 55 85',
    contact_email: 'contact@avaduparc.com',
  },
]

writeFileSync(join(OUT_DIR, 'images.json'), JSON.stringify(images, null, 2) + '\n')
writeFileSync(join(OUT_DIR, 'pages.json'), JSON.stringify(pages, null, 2) + '\n')

console.log(`✓ ${images.length} images -> src/mocks/fixtures/images.json`)
console.log(`✓ ${pages.length} pages -> src/mocks/fixtures/pages.json`)
