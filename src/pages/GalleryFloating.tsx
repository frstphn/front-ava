import type { WPPage } from '../types/wp'
import { useImages } from '../hooks/useImages'

export default function GalleryFloating({ page }: { page: WPPage }) {
  const { data: images } = useImages()
  const filtered = images?.filter((img) => img.page_cat.includes(page.slug)) ?? []

  return (
    <main>
      <h1>{page.title.rendered}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
      <p>{filtered.length} images — placement flottant à implémenter (brief §4 "Pages flottantes")</p>
    </main>
  )
}
