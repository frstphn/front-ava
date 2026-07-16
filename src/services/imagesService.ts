import mockImages from '../mocks/fixtures/images.json'
import type { WPImage } from '../types/wp'
import { apiMode, fetchWP } from './apiClient'

// Contrat réel WP, cf. "Ava du Parc.md" section 6 :
// GET /wp-json/wp/v2/media?per_page=300&_fields=id,source_url,media_details,color_tag,page_cat,date
const WP_MEDIA_PATH =
  '/media?per_page=300&_fields=id,source_url,media_details,color_tag,page_cat,date'

export async function getImages(): Promise<WPImage[]> {
  if (apiMode === 'mock') {
    return mockImages as WPImage[]
  }
  return fetchWP<WPImage[]>(WP_MEDIA_PATH)
}
