import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { WPPage } from '../types/wp'
import { useImages } from '../hooks/useImages'
import { usePages } from '../hooks/usePages'
import { useIsMobile } from '../hooks/useIsMobile'
import { getContainerWidth, type TitleZone } from '../utils/placeImage'
import { placeHomePreviewImages, type PreviewPlacement } from '../utils/placeHomePreview'
import './Home.css'

gsap.registerPlugin(ScrollTrigger)

// Sections magnétiques : ces 3 galeries précisément (pas Making-of ni Colors,
// qui ont leurs propres points d'accès ailleurs), + une section Infos & Contact.
const HOME_GALLERY_SLUGS = ['portraits', 'interieurs', 'reportage']
const PREVIEW_COUNT = 4

// Placement dédié à 4 images fixes (src/utils/placeHomePreview.ts) — le moteur de
// couloirs de GalleryFloating est conçu pour un flux dense, pas pour ce cas.
const PREVIEW_CONFIG = {
  minSize: 150,
  maxSize: 260,
  // header (128px) + marge : les vignettes sont petites, on évite qu'il les recouvre
  // trop (contrairement aux pages galeries où c'est assumé sur des images pleines).
  topOffset: 170,
  jitter: 0.06,
}

export default function Home({ page }: { page: WPPage }) {
  const { data: images } = useImages()
  const { data: pages } = usePages()
  const isMobile = useIsMobile()
  const sectionsRef = useRef<HTMLDivElement>(null)
  const titleRefs = useRef(new Map<string, HTMLHeadingElement>())
  const [placements, setPlacements] = useState<PreviewPlacement[][]>([])

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

  // Calculé après montage (pas en useMemo pendant le render) : il faut les titres déjà
  // rendus pour mesurer leur zone réelle et les éviter, comme sur les pages galeries.
  useEffect(() => {
    if (isMobile || gallerySections.length === 0) return

    const containerWidth = getContainerWidth()
    const viewportHeight = window.innerHeight

    const next = gallerySections.map(({ slug, previewImages }) => {
      const titleRect = titleRefs.current.get(slug)?.getBoundingClientRect()
      const titleZone: TitleZone | null = titleRect
        ? {
            x1: titleRect.left - 20,
            x2: titleRect.right + 20,
            y1: titleRect.top - 20,
            y2: titleRect.bottom + 20,
          }
        : null

      return placeHomePreviewImages(previewImages, containerWidth, viewportHeight, titleZone, PREVIEW_CONFIG)
    })

    setPlacements(next)
  }, [isMobile, gallerySections])

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
              {placements[i]?.map((pos, j) => {
                const img = previewImages[j]
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
                <h2 ref={(el) => void (el && titleRefs.current.set(slug, el))}>{galleryPage.title.rendered}</h2>
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
