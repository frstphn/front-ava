import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { WPPage } from '../types/wp'
import { useImages } from '../hooks/useImages'
import { usePages } from '../hooks/usePages'
import { useIsMobile } from '../hooks/useIsMobile'
import { placeImage, getImageDimensions } from '../utils/placeImage'
import './Home.css'

gsap.registerPlugin(ScrollTrigger)

// Sections magnétiques : ces 3 galeries précisément (pas Making-of ni Colors,
// qui ont leurs propres points d'accès ailleurs), + une section Infos & Contact.
const HOME_GALLERY_SLUGS = ['portraits', 'interieurs', 'reportage']
const PREVIEW_COUNT = 4

// Même moteur de placement que GalleryFloating (src/utils/placeImage.ts), réglé
// plus compact pour un aperçu de 4 images sur une seule section. 2 couloirs
// centrés loin du milieu de l'écran pour laisser le titre respirer, sans avoir
// besoin de mesurer sa zone comme sur les pages galeries.
const PREVIEW_PLACEMENT_CONFIG = {
  minSize: 140,
  maxSize: 260,
  laneCount: 2,
  horizontalJitter: 30,
  verticalGap: -10,
  verticalGapJitter: 50,
}

export default function Home({ page }: { page: WPPage }) {
  const { data: images } = useImages()
  const { data: pages } = usePages()
  const isMobile = useIsMobile()
  const sectionsRef = useRef<HTMLDivElement>(null)

  const gallerySections = useMemo(() => {
    return HOME_GALLERY_SLUGS.map((slug) => {
      const galleryPage = pages?.find((p) => p.slug === slug)
      const previewImages = (images ?? [])
        .filter((img) => img.page_cat.includes(slug))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, PREVIEW_COUNT)
      return { slug, page: galleryPage, previewImages }
    }).filter((s): s is typeof s & { page: WPPage } => Boolean(s.page))
  }, [pages, images])

  // Un jeu de couloirs indépendant par section — les images de chaque section ne
  // doivent pas se répartir dans le même espace vertical que celles des autres.
  const placements = useMemo(() => {
    return gallerySections.map(({ previewImages }) => {
      const laneBottoms = [0, 0]
      return previewImages.map((img) =>
        placeImage(
          window.innerWidth,
          laneBottoms,
          getImageDimensions(img),
          null,
          window.innerHeight,
          PREVIEW_PLACEMENT_CONFIG,
        ),
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gallerySections])

  useEffect(() => {
    if (isMobile || !sectionsRef.current) return

    const ctx = gsap.context(() => {
      const sections = sectionsRef.current!.querySelectorAll('.home-section')

      sections.forEach((section) => {
        gsap.from(section.querySelector('.home-section__content, .home__actuality'), {
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
        // distance de scroll du conteneur pour que chaque point de snap tombe
        // pile sur le haut d'une section.
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

  const actualityBlock = (
    <div className="home__actuality">
      <div className="home__actuality-media">
        {page.featured_image_url && <img src={page.featured_image_url} alt="" />}
      </div>
      <div className="home__actuality-text-col">
        <h1 className="home__actuality-title" dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
        <div className="home__actuality-text" dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
      </div>
    </div>
  )

  return (
    <main className="page home">
      {isMobile ? (
        <div className="home-sections home-sections--mobile">
          {actualityBlock}
          {gallerySections.map(({ slug, page: galleryPage, previewImages }) => (
            <Link key={slug} to={`/${slug}`} className="home-section-mobile">
              <h2>{galleryPage.title.rendered}</h2>
              <div className="home-section-mobile__images">
                {previewImages.map((img) => (
                  <img
                    key={img.id}
                    src={img.media_details?.sizes?.grid?.source_url ?? img.source_url}
                    loading="lazy"
                    alt=""
                  />
                ))}
              </div>
            </Link>
          ))}
          <Link to="/a-propos" className="home-section-mobile">
            <h2>Infos &amp; Contact</h2>
          </Link>
        </div>
      ) : (
        <div ref={sectionsRef} className="home-sections">
          <section className="home-section home-section--actuality">{actualityBlock}</section>

          {gallerySections.map(({ slug, page: galleryPage, previewImages }, i) => (
            <Link key={slug} to={`/${slug}`} className="home-section">
              {previewImages.map((img, j) => {
                const pos = placements[i][j]
                return (
                  <img
                    key={img.id}
                    src={img.media_details?.sizes?.grid?.source_url ?? img.source_url}
                    loading="lazy"
                    className="home-section__image"
                    style={{ left: pos.x, top: pos.y, width: pos.width, height: pos.height }}
                    alt=""
                  />
                )
              })}
              <div className="home-section__content">
                <h2>{galleryPage.title.rendered}</h2>
              </div>
            </Link>
          ))}

          <Link to="/a-propos" className="home-section home-section--plain">
            <div className="home-section__content">
              <h2>Infos &amp; Contact</h2>
            </div>
          </Link>
        </div>
      )}

      <button
        type="button"
        className="home__scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Retour en haut de page"
      >
        ▲
      </button>
    </main>
  )
}
