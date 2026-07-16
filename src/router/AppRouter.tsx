import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { usePages } from '../hooks/usePages'
import { templateMap } from './templateMap'
import Splash from '../pages/Splash'
import GalleryFloating from '../pages/GalleryFloating'

export default function AppRouter() {
  const { data: pages, isLoading, isError } = usePages()

  if (isLoading) return <div className="app-loading">Chargement…</div>
  if (isError || !pages) return <div className="app-error">Impossible de charger les pages.</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        {pages.map((page) => {
          const Component = templateMap[page.template] ?? GalleryFloating
          return <Route key={page.slug} path={`/${page.slug}`} element={<Component page={page} />} />
        })}
      </Routes>
    </BrowserRouter>
  )
}
