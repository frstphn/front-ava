import type { WPPage } from '../types/wp'
import './About.css'

export default function About({ page }: { page: WPPage }) {
  return (
    <main className="page about">
      <div className="about__portrait-col">
        {page.featured_image_url && <img src={page.featured_image_url} alt="" />}
        {(page.contact_phone || page.contact_email) && (
          <div className="about__contact">
            {page.contact_phone && <p>{page.contact_phone}</p>}
            {page.contact_email && <p>{page.contact_email}</p>}
          </div>
        )}
      </div>

      <div className="about__cv" dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
    </main>
  )
}
