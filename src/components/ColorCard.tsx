import type { WPImage } from '../types/wp'
import './ColorCard.css'

interface ColorCardProps {
  image: WPImage
  flipped: boolean
  delayMs: number
  onOpen: () => void
}

// Carte à retournement 3D — brief §4 "Colors". Le dos (vide) est révélé quand
// l'image ne correspond pas au filtre couleur actif.
export default function ColorCard({ image, flipped, delayMs, onOpen }: ColorCardProps) {
  return (
    <div className="color-card">
      <div
        className={`color-card__inner${flipped ? ' is-flipped' : ''}`}
        style={{ transitionDelay: `${delayMs}ms` }}
      >
        <button
          type="button"
          className="color-card__face color-card__face--front"
          onClick={onOpen}
          disabled={flipped}
          aria-label="Voir en grand"
          tabIndex={flipped ? -1 : 0}
        >
          <img src={image.media_details?.sizes?.grid?.source_url ?? image.source_url} loading="lazy" alt="" />
        </button>
        <div className="color-card__face color-card__face--back" aria-hidden="true" />
      </div>
    </div>
  )
}
