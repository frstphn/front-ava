import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { usePages } from '../hooks/usePages'
import { templateMap } from './templateMap'
import Splash from '../pages/Splash'
import Header from '../components/Header'
import ColorsSpiralButton from '../components/ColorsSpiralButton'

function HeaderGate() {
  const location = useLocation()
  if (location.pathname === '/') return null
  return <Header />
}

export default function AppRouter() {
  const { data: pages, isLoading, isError } = usePages()

  if (isLoading) return <div className="app-loading">Chargement…</div>
  if (isError || !pages) return <div className="app-error">Impossible de charger les pages.</div>

  return (
    <BrowserRouter>
      <HeaderGate />
      <ColorsSpiralButton />
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
