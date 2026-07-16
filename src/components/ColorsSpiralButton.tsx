import { Link } from 'react-router-dom'
import './ColorsSpiralButton.css'

// Bouton fixe présent sur toutes les pages (y compris Splash) — seul point
// d'accès à la page Colors, cf. maquette "loto des couleurs qui se balade et cliquable".
// WebP animé (fond transparent, 82px, q60) plutôt que la vidéo source —
// voir le récapitulatif de conversion pour le détail des poids.
export default function ColorsSpiralButton() {
  return (
    <Link to="/colors" className="spiral-button" aria-label="Aller à la page Colors">
      <img className="spiral-button__image" src="/spinner.webp" alt="" aria-hidden="true" />
    </Link>
  )
}
