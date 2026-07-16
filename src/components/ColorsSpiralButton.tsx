import { Link } from 'react-router-dom'
import './ColorsSpiralButton.css'

// Bouton fixe présent sur toutes les pages (y compris Splash) — seul point
// d'accès à la page Colors, cf. maquette "loto des couleurs qui se balade et cliquable".
export default function ColorsSpiralButton() {
  return (
    <Link to="/colors" className="spiral-button" aria-label="Aller à la page Colors">
      <video
        className="spiral-button__video"
        src="/spinner.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
    </Link>
  )
}
