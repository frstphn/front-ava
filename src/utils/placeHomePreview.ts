// Placement dédié aux sections magnétiques de la Home — 4 images fixes par section
// (les "4 dernières mises en ligne" de la maquette), pas un flux dense. Le moteur de
// couloirs de placeImage.ts est prévu pour répartir des dizaines d'images en scroll
// infini ; appliqué à seulement 4 images il donne 3 colonnes rigides sans chevauchement
// (constaté en pratique) — ici on place explicitement chaque image dans l'une de 4
// zones fixes avec un jitter généreux, pensé pour ce nombre précis d'éléments.
import type { WPImage } from '../types/wp'
import { getImageDimensions, type TitleZone } from './placeImage'

export interface PreviewPlacement {
  x: number
  y: number
  width: number
  height: number
}

export interface PreviewPlacementConfig {
  minSize: number
  maxSize: number
  /** Marge depuis le haut de la section (sous le header) avant toute image. */
  topOffset: number
  /** Dérive aléatoire autour de chaque zone, en fraction de la largeur/hauteur utile. */
  jitter: number
}

// Zones en fraction de la largeur / hauteur utile (haut-gauche, haut-droite,
// bas-gauche, bas-droite) — écartées du centre pour laisser le titre respirer.
const ZONES = [
  { x: 0.12, y: 0.18 },
  { x: 0.68, y: 0.14 },
  { x: 0.16, y: 0.64 },
  { x: 0.62, y: 0.58 },
]

export function placeHomePreviewImages(
  images: WPImage[],
  containerWidth: number,
  viewportHeight: number,
  titleZone: TitleZone | null,
  config: PreviewPlacementConfig,
): PreviewPlacement[] {
  const { minSize, maxSize, topOffset, jitter } = config
  const usableHeight = Math.max(viewportHeight - topOffset, 0)

  return images.map((img, i) => {
    const zone = ZONES[i % ZONES.length]
    const targetSize = Math.random() * (maxSize - minSize) + minSize
    const dims = getImageDimensions(img)
    const ratio = dims.width / dims.height
    const width = ratio >= 1 ? targetSize : targetSize * ratio
    const height = ratio >= 1 ? targetSize / ratio : targetSize

    const baseX = zone.x * containerWidth
    const baseY = topOffset + zone.y * usableHeight

    const x = Math.min(
      Math.max(baseX + (Math.random() * 2 - 1) * jitter * containerWidth, 0),
      Math.max(containerWidth - width, 0),
    )
    let y = Math.min(
      Math.max(baseY + (Math.random() * 2 - 1) * jitter * usableHeight, topOffset),
      Math.max(viewportHeight - height, topOffset),
    )

    if (titleZone) {
      const overlaps = x < titleZone.x2 && x + width > titleZone.x1 && y < titleZone.y2 && y + height > titleZone.y1
      if (overlaps) {
        // Pousse au-dessus ou en dessous du titre selon la zone d'origine, plutôt
        // que de changer de zone (chaque zone doit rester représentée).
        y =
          zone.y < 0.5
            ? Math.max(topOffset, titleZone.y1 - height - 10)
            : Math.min(titleZone.y2 + 10, viewportHeight - height)
      }
    }

    return { x, y, width, height }
  })
}
