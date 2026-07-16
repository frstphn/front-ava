import type { WPPage } from '../types/wp'
import { useImages } from '../hooks/useImages'

export default function Home({ page }: { page: WPPage }) {
  const { data: images } = useImages()

  return (
    <main>
      <h1>{page.title.rendered}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
      <p>{images?.length ?? 0} images chargées — sections magnétiques à implémenter (brief §4 "Accueil")</p>
    </main>
  )
}
