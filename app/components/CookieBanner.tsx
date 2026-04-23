'use client'

import { useEffect, useState } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('ares_cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  const aceptar = () => {
    localStorage.setItem('ares_cookie_consent', 'accepted')
    setVisible(false)
  }

  const rechazar = () => {
    localStorage.setItem('ares_cookie_consent', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md bg-[#051a14] border border-white/10 p-6 rounded-2xl shadow-2xl z-50 backdrop-blur-xl">
      
      <p className="text-[11px] text-white/70 uppercase tracking-wider mb-4 leading-relaxed">
        Utilizamos cookies para mejorar tu experiencia en ARES.
      </p>

      <div className="flex gap-3">
        <button
          onClick={rechazar}
          className="flex-1 bg-white/5 border border-white/10 text-white text-[10px] py-2 rounded-xl uppercase tracking-widest hover:bg-white/10"
        >
          Rechazar
        </button>

        <button
          onClick={aceptar}
          className="flex-1 bg-[#10b981] text-black text-[10px] py-2 rounded-xl uppercase tracking-widest font-black hover:bg-[#0d9668]"
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}