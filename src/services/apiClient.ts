// Flag de bascule mock <-> WordPress réel.
// VITE_API_MODE=mock (défaut) : les services lisent les fixtures locales.
// VITE_API_MODE=wp            : les services tapent l'API REST WP (VITE_WP_BASE_URL).
export const apiMode = (import.meta.env.VITE_API_MODE ?? 'mock') as 'mock' | 'wp'

const WP_BASE_URL = import.meta.env.VITE_WP_BASE_URL ?? ''

export async function fetchWP<T>(path: string): Promise<T> {
  if (!WP_BASE_URL) {
    throw new Error('VITE_WP_BASE_URL manquant — requis quand VITE_API_MODE=wp')
  }
  const res = await fetch(`${WP_BASE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`WP API error ${res.status} on ${path}`)
  }
  return res.json() as Promise<T>
}
