import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Typed from 'typed.js'
import './Splash.css'

const SESSION_KEY = 'ava-splash-seen'

export default function Splash() {
  const [alreadySeen] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const navigate = useNavigate()
  const typedElRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (alreadySeen) return
    sessionStorage.setItem(SESSION_KEY, '1')

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
  }, [alreadySeen, navigate])

  if (alreadySeen) {
    return <Navigate to="/accueil" replace />
  }

  return (
    <main className="splash" onClick={() => navigate('/accueil')}>
      <div className="splash__stage">
        {/* Réserve la largeur de "Photograph her" pour que "Ava du Parc" (plus court)
            démarre au même x — aligné avec le P de Photographer, cf. maquette. */}
        <span className="splash__ghost" aria-hidden="true">
          Photograp<i>her</i>
        </span>
        <span ref={typedElRef} className="splash__text" />
      </div>
    </main>
  )
}
