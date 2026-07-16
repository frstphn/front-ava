import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Typed from 'typed.js'
import './Splash.css'

export default function Splash() {
  const navigate = useNavigate()
  const typedElRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const typed = new Typed(typedElRef.current, {
      strings: ['Ava du Parc', 'Photograp<i>her</i>'],
      contentType: 'html',
      typeSpeed: 80,
      backSpeed: 40,
      backDelay: 1200,
      showCursor: true,
      onComplete: () => {
        setTimeout(() => navigate('/accueil'), 800)
      },
    })

    return () => typed.destroy()
  }, [navigate])

  return (
    <main className="splash" onClick={() => navigate('/accueil')}>
      <div className="splash__stage">
        {/* Réserve la largeur de "Photograph her" pour que "Ava du Parc" (plus court)
            démarre au même x — aligné avec le P de Photographer, cf. maquette.
            Le wrapper (pas le span typed lui-même) porte la superposition grid :
            Typed.js insère son curseur comme sibling du span, il doit donc rester
            dans un flux normal pour progresser avec les lettres plutôt que de se
            figer au bord droit de la zone réservée. */}
        <span className="splash__ghost" aria-hidden="true">
          Photograp<i>her</i>
        </span>
        <span className="splash__typed-wrapper">
          <span ref={typedElRef} className="splash__text" />
        </span>
      </div>
    </main>
  )
}
