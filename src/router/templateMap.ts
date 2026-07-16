import { lazy, type ComponentType } from 'react'
import type { PageTemplate, WPPage } from '../types/wp'

// Lazy : chaque page part dans son propre chunk (Home embarque gsap, ~140Ko
// gzip à elle seule) plutôt que d'alourdir le bundle initial de chaque route.
const Home = lazy(() => import('../pages/Home'))
const GalleryFloating = lazy(() => import('../pages/GalleryFloating'))
const GalleryColors = lazy(() => import('../pages/GalleryColors'))
const About = lazy(() => import('../pages/About'))

export const templateMap: Record<PageTemplate, ComponentType<{ page: WPPage }>> = {
  home: Home,
  'gallery-floating': GalleryFloating,
  'gallery-colors': GalleryColors,
  about: About,
}
