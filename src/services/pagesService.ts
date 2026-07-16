import mockPages from '../mocks/fixtures/pages.json'
import type { WPPage } from '../types/wp'
import { apiMode, fetchWP } from './apiClient'

// GET /wp-json/wp/v2/pages?_fields=slug,template,title,content
const WP_PAGES_PATH = '/pages?_fields=slug,template,title,content'

export async function getPages(): Promise<WPPage[]> {
  if (apiMode === 'mock') {
    return mockPages as WPPage[]
  }
  return fetchWP<WPPage[]>(WP_PAGES_PATH)
}
