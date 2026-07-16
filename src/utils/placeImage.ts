// Adapté du brief §6 "Algorithme de placement flottant".
const MAX_ATTEMPTS = 10

export interface TitleZone {
  x1: number
  x2: number
  y1: number
  y2: number
}

export interface Placement {
  x: number
  y: number
  size: number
}

export interface PlaceImageConfig {
  minSize: number
  maxSize: number
  /** Écart vertical moyen entre deux images (px) — cf. src/config/galleryFloating.ts. */
  verticalStep: number
  /** Amplitude aléatoire autour de l'écart vertical (px). */
  verticalJitter: number
}

export function placeImage(
  containerWidth: number,
  currentY: number,
  titleZone: TitleZone | null,
  viewportHeight: number,
  config: PlaceImageConfig,
): Placement {
  const { minSize, maxSize, verticalStep, verticalJitter } = config
  const size = Math.floor(Math.random() * (maxSize - minSize)) + minSize
  let attempt = 0

  while (attempt < MAX_ATTEMPTS) {
    const x = Math.random() * Math.max(containerWidth - size, 0)
    const y = currentY + verticalStep + (Math.random() * 2 - 1) * verticalJitter

    // Phase 1 (premier viewport) : évite la zone du titre. Au-delà, placement libre.
    if (titleZone && y < viewportHeight) {
      const overlapsTitle =
        x < titleZone.x2 && x + size > titleZone.x1 && y < titleZone.y2 && y + size > titleZone.y1

      if (overlapsTitle) {
        attempt++
        continue
      }
    }

    return { x, y, size }
  }

  // Fallback : colle l'image sur le côté gauche libre
  return { x: 10, y: currentY, size }
}
