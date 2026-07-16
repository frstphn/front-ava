import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { WPImage } from '../types/wp'
import './Lightbox.css'

interface LightboxProps {
  images: WPImage[]
  startIndex: number
  onClose: () => void
  /** 'dark' : galeries flottantes (brief §6). 'frosted' : page Colors (brief §4). */
  variant?: 'dark' | 'frosted'
}

export default function Lightbox({ images, startIndex, onClose, variant = 'dark' }: LightboxProps) {
  const [index, setIndex] = useState(startIndex)
  const img = images[index]

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, onClose])

  if (!img) return null

  return createPortal(
    <div className={`lightbox lightbox--${variant}`} onClick={onClose}>
      <button
        type="button"
        className="lightbox__nav lightbox__nav--prev"
        onClick={(e) => {
          e.stopPropagation()
          prev()
        }}
        aria-label="Image précédente"
      >
        ←
      </button>

      <img
        className="lightbox__image"
        src={img.media_details?.sizes?.lightbox?.source_url ?? img.source_url}
        onClick={(e) => e.stopPropagation()}
        alt=""
      />

      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        onClick={(e) => {
          e.stopPropagation()
          next()
        }}
        aria-label="Image suivante"
      >
        →
      </button>

      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Fermer">
        ✕
      </button>
    </div>,
    document.body,
  )
}
