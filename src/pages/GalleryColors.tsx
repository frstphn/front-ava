import { useMemo, useState, type CSSProperties } from 'react'
import type { WPPage, WPImage } from '../types/wp'
import { useImages } from '../hooks/useImages'
import { useIsMobile } from '../hooks/useIsMobile'
import ColorCard from '../components/ColorCard'
import Lightbox from '../components/Lightbox'
import './GalleryColors.css'

const COLOR_TAGS = ['blanc', 'rouge', 'vert', 'bleu', 'jaune', 'magenta', 'cyan', 'noir']
const FILTERS = ['*', ...COLOR_TAGS]

// Fond derrière la grille = la couleur nommée par le filtre actif (pas juste un
// vague lavis) — "blanc" doit donner un fond réellement blanc, etc.
const AMBIENT_COLORS: Record<string, string> = {
  '*': 'transparent',
  blanc: '#ffffff',
  rouge: '#e24b4a',
  vert: '#639322',
  bleu: '#378add',
  jaune: '#ef9f27',
  magenta: '#d4537e',
  cyan: '#5dcaa5',
  noir: '#2c2c2a',
}

// Étale la vague de flip sur une durée fixe plutôt qu'un délai de i*30ms par carte
// (littéral du brief) — sur 100-300 images ça ferait plusieurs secondes de vague.
const WAVE_DURATION_MS = 400

function matchesFilter(img: WPImage, filter: string) {
  return filter === '*' || img.color_tag.includes(filter)
}

export default function GalleryColors({ page }: { page: WPPage }) {
  const { data: images } = useImages()
  const isMobile = useIsMobile()
  const [activeFilter, setActiveFilter] = useState('*')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const sortedImages = useMemo(() => {
    if (!images) return []
    return [...images].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [images])

  const visibleImages = useMemo(
    () => sortedImages.filter((img) => matchesFilter(img, activeFilter)),
    [sortedImages, activeFilter],
  )

  const visibleIndexById = useMemo(() => {
    const map = new Map<number, number>()
    visibleImages.forEach((img, i) => map.set(img.id, i))
    return map
  }, [visibleImages])

  if (!images) {
    return (
      <main className="page">
        <p className="gallery-colors__loading">Chargement…</p>
      </main>
    )
  }

  if (isMobile) {
    return (
      <main className="page gallery-colors gallery-colors--mobile">
        <h1>{page.title.rendered}</h1>

        <div className="gallery-colors__mobile-list">
          {visibleImages.map((img) => (
            <a
              key={img.id}
              href={img.media_details?.sizes?.lightbox?.source_url ?? img.source_url}
              target="_blank"
              rel="noreferrer"
            >
              <img src={img.media_details?.sizes?.grid?.source_url ?? img.source_url} loading="lazy" alt="" />
            </a>
          ))}
        </div>

        <div className="gallery-colors__filters gallery-colors__filters--mobile">
          {FILTERS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={activeFilter === tag ? 'is-active' : ''}
              onClick={() => setActiveFilter(tag)}
            >
              {tag === '*' ? 'Tout' : tag}
            </button>
          ))}
        </div>
      </main>
    )
  }

  const pageStyle = { '--ambient-color': AMBIENT_COLORS[activeFilter] ?? 'transparent' } as CSSProperties

  return (
    <main className="page gallery-colors" style={pageStyle}>
      <h1>{page.title.rendered}</h1>

      <div className="gallery-colors__grid">
        {sortedImages.map((img, i) => {
          const flipped = !matchesFilter(img, activeFilter)
          return (
            <ColorCard
              key={img.id}
              image={img}
              flipped={flipped}
              delayMs={(i / sortedImages.length) * WAVE_DURATION_MS}
              onOpen={() => {
                const idx = visibleIndexById.get(img.id)
                if (idx !== undefined) setLightboxIndex(idx)
              }}
            />
          )
        })}
      </div>

      <div className="gallery-colors__filters">
        {FILTERS.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`filter-btn${activeFilter === tag ? ' active' : ''}`}
            onClick={() => setActiveFilter(tag)}
          >
            {tag === '*' ? 'Tout' : tag}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={visibleImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </main>
  )
}
