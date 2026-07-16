import type { WPPage } from '../types/wp'

export default function About({ page }: { page: WPPage }) {
  return (
    <main>
      <h1>{page.title.rendered}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
    </main>
  )
}
