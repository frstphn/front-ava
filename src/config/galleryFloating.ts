// Réglages exposés pour ajuster visuellement GalleryFloating sans toucher à
// la logique de placement — change ces valeurs et recharge la page pour tester.
export const GALLERY_FLOATING_CONFIG = {
  /** Taille cible du plus grand côté de chaque image (px), tirée aléatoirement entre
   *  les deux bornes. Le ratio d'aspect réel de l'image est toujours respecté (pas de
   *  crop carré forcé) — une image portrait ou paysage garde sa proportion. */
  minImageSize: 300,
  maxImageSize: 800,

  /** Images chargées par batch de scroll infini — plus haut = plus dense par écran. */
  batchSize: 10,

  /** Densité horizontale : nombre de couloirs verticaux dans lesquels les images sont
   *  réparties. Plus de couloirs = images plus resserrées côte à côte, plusieurs images
   *  au même niveau (chacune démarrant à sa propre hauteur, pas d'alignement en grille). */
  laneCount: 3,

  /** Dérive horizontale aléatoire depuis le centre du couloir (px) — permet aux images
   *  de couloirs voisins de se chevaucher légèrement plutôt que de rester cloisonnées. */
  horizontalJitter: 80,

  /** Densité verticale : écart entre le bas d'une image et le haut de la suivante dans
   *  le même couloir (px). Négatif = chevauchement systématique, positif = espacement.
   *  Un chevauchement modéré (pas la norme) s'obtient avec une valeur proche de 0 et un
   *  jitter assez large pour que ça arrive occasionnellement dans les deux sens. */
  verticalGap: 20,
  /** Amplitude aléatoire autour de l'écart vertical (px). */
  verticalGapJitter: 60,
}
