import type { WPPage } from '../types/wp'
import { useImages } from '../hooks/useImages'

export default function GalleryColors({ page }: { page: WPPage }) {
  const { data: images } = useImages()

  return (
    <main>
      <h1>{page.title.rendered}</h1>
      <p>{images?.length ?? 0} images — grille + flip cards à implémenter (brief §4 "Colors")</p>
    </main>
  )
}
