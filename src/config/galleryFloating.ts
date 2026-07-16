// Réglages exposés pour ajuster visuellement GalleryFloating sans toucher à
// la logique de placement — change ces valeurs et recharge la page pour tester.
export const GALLERY_FLOATING_CONFIG = {
  /** Taille min/max des images flottantes (px), tirée aléatoirement entre les deux. */
  minImageSize: 100,
  maxImageSize: 400,

  /** Images chargées par batch de scroll infini — plus haut = plus dense par écran. */
  batchSize: 10,

  /** Écart vertical moyen entre deux images placées (px) — plus petit = plus dense. */
  verticalStep: 10,
  /** Amplitude aléatoire autour de l'écart vertical (px). */
  verticalJitter: 30,
}
