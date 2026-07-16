// Formes calquées sur les réponses WP REST documentées dans le brief.
// NB: color_tag/page_cat doivent sortir en slugs (string[]) côté WP via
// register_rest_field — pas les IDs de terme bruts renvoyés par défaut par /wp/v2/media.

export interface WPRenderedField {
  rendered: string
}

export interface WPImageSize {
  source_url: string
  width: number
  height: number
}

export interface WPImage {
  id: number
  date: string
  source_url: string
  media_details: {
    width: number
    height: number
    sizes: {
      thumbnail?: WPImageSize
      grid?: WPImageSize
      lightbox?: WPImageSize
    }
  }
  color_tag: string[]
  page_cat: string[]
}

export type PageTemplate = 'home' | 'gallery-floating' | 'gallery-colors' | 'about'

export interface WPPage {
  slug: string
  template: PageTemplate
  title: WPRenderedField
  content: WPRenderedField
  /** _thumbnail_id résolu en URL — image mise en avant (bloc actualité, portrait About). */
  featured_image_url?: string
  /** Champs custom (type ACF) portés par la page À propos. */
  contact_phone?: string
  contact_email?: string
}
