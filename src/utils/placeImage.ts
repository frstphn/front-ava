// Adapté du brief §6 "Algorithme de placement flottant".
const MIN_SIZE = 100
const MAX_SIZE = 400
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

export function placeImage(
  containerWidth: number,
  currentY: number,
  titleZone: TitleZone | null,
  viewportHeight: number,
): Placement {
  const size = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE)) + MIN_SIZE
  let attempt = 0

  while (attempt < MAX_ATTEMPTS) {
    const x = Math.random() * Math.max(containerWidth - size, 0)
    const y = currentY + (Math.random() * 60 - 20)

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
