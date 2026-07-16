import { useCallback, useEffect, useRef, useState } from 'react'
import type { WPPage, WPImage } from '../types/wp'
import { useImages } from '../hooks/useImages'
import { useIsMobile } from '../hooks/useIsMobile'
import { shuffle } from '../utils/shuffle'
import { placeImage, getImageDimensions, type TitleZone } from '../utils/placeImage'
import { GALLERY_FLOATING_CONFIG } from '../config/galleryFloating'
import Lightbox from '../components/Lightbox'
import './GalleryFloating.css'

// Proportion d'images qui passent derrière le titre plutôt que devant —
// cf. maquette "le mot [titre] passe tantôt par dessus tantôt par dessous".
const BEHIND_TITLE_RATIO = 0.35

interface PlacedImage extends WPImage {
  x: number
  y: number
  width: number
  height: number
  behindTitle: boolean
}

export default function GalleryFloating({ page }: { page: WPPage }) {
  const { data: images, isLoading } = useImages()

  if (isLoading || !images) {
    return (
      <main className="page">
        <p className="gallery-floating__loading">Chargement…</p>
      </main>
    )
  }

  const filtered = images.filter((img) => img.page_cat.includes(page.slug))

  // Composant enfant : garantit que le useState(shuffle) ci-dessous ne s'exécute
  // qu'une fois les vraies images disponibles (sinon il figerait un tableau vide).
  return <GalleryFloatingBody key={page.slug} page={page} images={filtered} />
}

function GalleryFloatingBody({ page, images }: { page: WPPage; images: WPImage[] }) {
  const [orderedImages] = useState<WPImage[]>(() => shuffle(images))
  const [placed, setPlaced] = useState<PlacedImage[]>([])
  const [maxBottom, setMaxBottom] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const batchRef = useRef(0)
  // Un curseur Y par couloir (densité horizontale) — cf. src/utils/placeImage.ts.
  const laneBottomsRef = useRef<number[]>(new Array(GALLERY_FLOATING_CONFIG.laneCount).fill(0))
  const titleRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const loadNextBatch = useCallback(() => {
    const { batchSize, minImageSize, maxImageSize, laneCount, horizontalJitter, verticalGap, verticalGapJitter } =
      GALLERY_FLOATING_CONFIG
    const next = orderedImages.slice(batchRef.current * batchSize, (batchRef.current + 1) * batchSize)
    if (!next.length) return

    const titleRect = titleRef.current?.getBoundingClientRect()
    const titleZone: TitleZone | null = titleRect
      ? {
          x1: titleRect.left - 20,
          x2: titleRect.right + 20,
          y1: titleRect.top - 20,
          y2: titleRect.bottom + 20,
        }
      : null

    const newPlaced = next.map((img) => {
      const pos = placeImage(
        window.innerWidth,
        laneBottomsRef.current,
        getImageDimensions(img),
        titleZone,
        window.innerHeight,
        { minSize: minImageSize, maxSize: maxImageSize, laneCount, horizontalJitter, verticalGap, verticalGapJitter },
      )
      return { ...img, ...pos, behindTitle: Math.random() < BEHIND_TITLE_RATIO }
    })

    setPlaced((prev) => [...prev, ...newPlaced])
    setMaxBottom(Math.max(...laneBottomsRef.current))
    batchRef.current += 1
  }, [orderedImages])

  useEffect(() => {
    if (isMobile) return
    loadNextBatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  useEffect(() => {
    if (isMobile || !sentinelRef.current) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadNextBatch()
      },
      { threshold: 0.1 },
    )
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [isMobile, loadNextBatch, placed.length])

  if (isMobile) {
    return (
      <main className="page gallery-floating gallery-floating--mobile">
        <h1>{page.title.rendered}</h1>
        <div
          className="gallery-floating__description"
          dangerouslySetInnerHTML={{ __html: page.content.rendered }}
        />
        <div className="gallery-floating__mobile-list">
          {orderedImages.map((img) => (
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
      </main>
    )
  }

  return (
    <main className="page gallery-floating" style={{ minHeight: maxBottom + 200 }}>
      <div ref={titleRef} className="gallery-floating__title">
        <h1>{page.title.rendered}</h1>
        <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
      </div>

      {placed.map((img, i) => (
        <img
          key={img.id}
          src={img.media_details?.sizes?.grid?.source_url ?? img.source_url}
          loading="lazy"
          onClick={() => setLightboxIndex(i)}
          className={`gallery-floating__image${img.behindTitle ? ' is-behind-title' : ''}`}
          style={{ left: img.x, top: img.y, width: img.width, height: img.height }}
          alt=""
        />
      ))}

      <div ref={sentinelRef} className="gallery-floating__sentinel" />

      {lightboxIndex !== null && (
        <Lightbox images={orderedImages} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </main>
  )
}
