import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import './NavOverlay.css'

interface NavOverlayProps {
  items: { slug: string; label: string }[]
  onClose: () => void
}

// Overlay plein écran mobile — cf. maquette "Menu comme site Christopher Anderson" :
// liste verticale de liens, fond uni, sans effet supplémentaire.
//
// Rendu via portail dans document.body : le Header parent a un backdrop-filter,
// qui crée un containing block pour ses descendants en position:fixed — sans
// portail, cet overlay se dimensionnerait sur le Header (88px) au lieu du viewport.
export default function NavOverlay({ items, onClose }: NavOverlayProps) {
  return createPortal(
    <div className="nav-overlay">
      {items.map((item) => (
        <Link key={item.slug} to={`/${item.slug}`} onClick={onClose}>
          {item.label}
        </Link>
      ))}
    </div>,
    document.body,
  )
}
