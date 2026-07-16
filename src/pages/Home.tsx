import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { WPPage } from '../types/wp'
import { useImages } from '../hooks/useImages'
import { usePages } from '../hooks/usePages'
import { useIsMobile } from '../hooks/useIsMobile'
import './Home.css'

gsap.registerPlugin(ScrollTrigger)

// Une section magnétique par page-galerie (floating + colors), dérivée des
// pages WP plutôt qu'une liste figée — inclut donc aussi Making-of/Colors,
// pas seulement les 3 sections visibles sur la maquette partielle.
const GALLERY_TEMPLATES = new Set(['gallery-floating', 'gallery-colors'])

export default function Home({ page }: { page: WPPage }) {
  const { data: images } = useImages()
  const { data: pages } = usePages()
  const isMobile = useIsMobile()
  const sectionsRef = useRef<HTMLDivElement>(null)

  const gallerySections = useMemo(() => {
    return (pages ?? [])
      .filter((p) => GALLERY_TEMPLATES.has(p.template))
      .map((galleryPage) => {
        const cover = images?.find(
          (img) => galleryPage.template === 'gallery-colors' || img.page_cat.includes(galleryPage.slug),
        )
        return {
          page: galleryPage,
          coverUrl: cover?.media_details?.sizes?.grid?.source_url ?? cover?.source_url,
        }
      })
  }, [pages, images])

  useEffect(() => {
    if (isMobile || !sectionsRef.current || gallerySections.length === 0) return

    const ctx = gsap.context(() => {
      const sections = sectionsRef.current!.querySelectorAll('.home-section')

      sections.forEach((section) => {
        gsap.from(section.querySelector('.home-section__content'), {
          scrollTrigger: {
            trigger: section,
            start: 'top center',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 40,
          duration: 0.6,
          ease: 'power2.out',
        })
      })

      if (sections.length > 1) {
        // start/end explicites : la progression 0->1 doit couvrir exactement la
        // distance de scroll du conteneur (N sections de 100vh) pour que chaque
        // point de snap tombe pile sur le haut d'une section.
        ScrollTrigger.create({
          trigger: sectionsRef.current,
          start: 'top top',
          end: 'bottom bottom',
          snap: {
            snapTo: 1 / (sections.length - 1),
            duration: { min: 0.3, max: 0.6 },
            ease: 'power2.inOut',
          },
        })
      }
    }, sectionsRef)

    return () => ctx.revert()
  }, [isMobile, gallerySections.length])

  return (
    <main className="page home">
      <section className="home__actuality">
        {page.featured_image_url && <img src={page.featured_image_url} alt="" />}
        <div className="home__actuality-text">
          <h1 dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
          <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
        </div>
      </section>

      <div ref={sectionsRef} className="home-sections">
        {gallerySections.map(({ page: galleryPage, coverUrl }) => (
          <Link
            key={galleryPage.slug}
            to={`/${galleryPage.slug}`}
            className="home-section"
            style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
          >
            <div className="home-section__content">
              <h2>{galleryPage.title.rendered}</h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
