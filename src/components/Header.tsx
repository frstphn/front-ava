import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import NavOverlay from './NavOverlay'
import './Header.css'

// Ordre et sélection des liens observés dans les maquettes (header desktop) —
// "making-of" et "colors" ne figurent pas dans la nav principale.
export const NAV_ITEMS = [
  { slug: 'portraits', label: 'Portraits' },
  { slug: 'reportage', label: 'Reportage' },
  { slug: 'interieurs', label: 'Intérieurs' },
  { slug: 'a-propos', label: 'A propos' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="site-header">
      <Link to="/accueil" className="site-header__logo">
        Ava du Parc
      </Link>

      <nav className="site-header__nav">
        {NAV_ITEMS.map((item) => (
          <Link key={item.slug} to={`/${item.slug}`}>
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="site-header__burger"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={menuOpen}
      >
        <span className={menuOpen ? 'is-open' : ''}>{menuOpen ? '✕' : '☰'}</span>
      </button>

      {menuOpen && <NavOverlay items={NAV_ITEMS} onClose={() => setMenuOpen(false)} />}
    </header>
  )
}
