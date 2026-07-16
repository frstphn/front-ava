// Placement flottant par "couloirs" verticaux indépendants — chaque couloir a son
// propre curseur Y, ce qui permet à plusieurs images de partager le même niveau tout
// en démarrant à des hauteurs différentes (pas de sensation de grille), et laisse le
// jitter horizontal créer un chevauchement modéré entre couloirs voisins.
import type { WPImage } from '../types/wp'

export interface TitleZone {
  x1: number
  x2: number
  y1: number
  y2: number
}

export interface ImageDimensions {
  width: number
  height: number
}

export interface Placement {
  x: number
  y: number
  width: number
  height: number
}

export interface PlaceImageConfig {
  minSize: number
  maxSize: number
  laneCount: number
  /** Dérive horizontale aléatoire depuis le centre du couloir (px). */
  horizontalJitter: number
  /** Écart entre le bas de la dernière image du couloir et le haut de la nouvelle (px). */
  verticalGap: number
  /** Amplitude aléatoire autour de cet écart (px). */
  verticalGapJitter: number
}

/**
 * `laneBottoms` est muté en place : un curseur Y (bas de la dernière image placée)
 * par couloir, à conserver entre les appels (un par batch d'images chargées).
 *
 * `lane` est décidé par l'appelant (round-robin) plutôt que tiré au hasard ici : un
 * choix aléatoire répété à chaque tentative d'évitement du titre redirigeait presque
 * toujours les images du couloir central (qui chevauche la zone du titre, elle-même
 * centrée) vers les couloirs de bord — son curseur Y ne progressait jamais, le
 * couloir central restant vide indéfiniment, bien au-delà du premier viewport.
 */
export function placeImage(
  containerWidth: number,
  laneBottoms: number[],
  lane: number,
  dimensions: ImageDimensions,
  titleZone: TitleZone | null,
  viewportHeight: number,
  config: PlaceImageConfig,
): Placement {
  const { minSize, maxSize, laneCount, horizontalJitter, verticalGap, verticalGapJitter } = config

  const targetSize = Math.random() * (maxSize - minSize) + minSize
  const ratio = dimensions.width / dimensions.height
  const width = ratio >= 1 ? targetSize : targetSize * ratio
  const height = ratio >= 1 ? targetSize / ratio : targetSize

  // Centres de couloir "insérés" d'une demi-taille-max depuis les bords : sur des
  // couloirs de bord, centrer une image plus large que le couloir sur son propre
  // centre géométrique la pousserait hors du viewport. En basant l'inset sur maxSize
  // (fixe, pas la taille de CETTE image), la grille de couloirs reste stable.
  const halfMax = maxSize / 2
  const usableWidth = Math.max(containerWidth - maxSize, 0)
  const laneCenterX = laneCount > 1 ? halfMax + (usableWidth * lane) / (laneCount - 1) : containerWidth / 2

  const x = Math.min(
    Math.max(laneCenterX - width / 2 + (Math.random() * 2 - 1) * horizontalJitter, 0),
    containerWidth - width,
  )

  let y = laneBottoms[lane] + verticalGap + (Math.random() * 2 - 1) * verticalGapJitter

  // Phase 1 (premier viewport) : si l'image tombe sur la zone du titre, on la pousse
  // juste sous cette zone plutôt que de changer de couloir — le curseur du couloir
  // avance toujours, il ne reste jamais bloqué en attente indéfiniment.
  if (titleZone && y < viewportHeight) {
    const overlapsTitle =
      x < titleZone.x2 && x + width > titleZone.x1 && y < titleZone.y2 && y + height > titleZone.y1
    if (overlapsTitle) {
      y = titleZone.y2 + 20
    }
  }

  laneBottoms[lane] = y + height
  return { x, y, width, height }
}

/** Dimensions réelles de l'image (grid size, ou taille originale à défaut) — pour
 *  respecter son ratio d'aspect plutôt que de forcer un crop carré. */
export function getImageDimensions(img: WPImage): ImageDimensions {
  const grid = img.media_details?.sizes?.grid
  if (grid?.width && grid?.height) return { width: grid.width, height: grid.height }
  return { width: img.media_details?.width ?? 1, height: img.media_details?.height ?? 1 }
}

/** clientWidth (pas innerWidth) : exclut la scrollbar verticale déjà réservée par
 *  `scrollbar-gutter: stable` (index.css) — sinon les images placées près du bord
 *  droit avant l'apparition de la scrollbar débordent une fois qu'elle apparaît. */
export function getContainerWidth(): number {
  return document.documentElement.clientWidth
}
