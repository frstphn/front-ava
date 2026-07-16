import type { ComponentType } from 'react'
import type { PageTemplate, WPPage } from '../types/wp'
import Home from '../pages/Home'
import GalleryFloating from '../pages/GalleryFloating'
import GalleryColors from '../pages/GalleryColors'
import About from '../pages/About'

export const templateMap: Record<PageTemplate, ComponentType<{ page: WPPage }>> = {
  home: Home,
  'gallery-floating': GalleryFloating,
  'gallery-colors': GalleryColors,
  about: About,
}
