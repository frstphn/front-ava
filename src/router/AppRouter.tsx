import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { usePages } from '../hooks/usePages'
import { templateMap } from './templateMap'
import Splash from '../pages/Splash'
import Header from '../components/Header'
import ColorsSpiralButton from '../components/ColorsSpiralButton'

// Header masqué sur le Splash (route "/"). Bouton spirale masqué en plus sur
// /colors elle-même — inutile de proposer un lien vers la page où l'on est déjà.
function SiteChrome() {
  const location = useLocation()
  if (location.pathname === '/') return null
  return (
    <>
      <Header />
      {location.pathname !== '/colors' && <ColorsSpiralButton />}
    </>
  )
}

// Sous-chemin de déploiement (ex. "/front-ava" sur GitHub Pages) — vide en
// production WP où le site est servi à la racine du domaine.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function AppRouter() {
  const { data: pages, isLoading, isError } = usePages()

  if (isLoading) return <div className="app-loading">Chargement…</div>
  if (isError || !pages) return <div className="app-error">Impossible de charger les pages.</div>

  return (
    <BrowserRouter basename={basename}>
      <SiteChrome />
      <Suspense fallback={<div className="app-loading">Chargement…</div>}>
        <Routes>
          <Route path="/" element={<Splash />} />
          {pages.map((page) => {
            const Component = templateMap[page.template] ?? templateMap['gallery-floating']
            return <Route key={page.slug} path={`/${page.slug}`} element={<Component page={page} />} />
          })}
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
