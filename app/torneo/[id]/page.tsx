'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import html2canvas from 'html2canvas'
import * as htmlToImage from 'html-to-image'

export default function TorneoPublico() {
  const params = useParams()
  const torneoId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [torneo, setTorneo] = useState<any>(null)
  const [equipos, setEquipos] = useState<any[]>([])
  const [goleadores, setGoleadores] = useState<any[]>([])

  useEffect(() => {
    if (torneoId) init()
  }, [torneoId])

  const init = async () => {
    setLoading(true)

    const { data: torneoData } = await supabase
      .from('torneos')
      .select('*')
      .eq('id', torneoId)
      .maybeSingle()

    if (torneoData) setTorneo(torneoData)

    const { data: equiposData } = await supabase
      .from('equipos')
      .select('*')
      .eq('torneo_id', torneoId)
      .order('puntos', { ascending: false })
      .order('diferencia', { ascending: false })
      .order('goles_favor', { ascending: false })

    if (equiposData) setEquipos(equiposData)

    const equiposIds = equiposData?.map(e => e.id) || []
    if (equiposIds.length > 0) {
      const { data: goleadoresData } = await supabase
        .from('goleo')
        .select('*, equipos(nombre)')
        .in('equipo_id', equiposIds)
        .order('goles', { ascending: false })

      if (goleadoresData) setGoleadores(goleadoresData)
    }

    setLoading(false)
  }

  // ✅ FUNCIÓN PARA DESCARGAR COMO JPG
const descargarComoJPG = async () => {
  const element =
    document.getElementById('torneo-content') ||
    document.getElementById('torneo-gestion-content')

  if (!element) return

  try {
    const dataUrl = await htmlToImage.toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#050f0c',
      cacheBust: true
    })

    // 🔥 convertir a blob
    const blob = await (await fetch(dataUrl)).blob()

    const file = new File([blob], `torneo-${torneo?.nombre || 'ARES'}.jpg`, {
      type: 'image/jpeg'
    })

    // 📱 compartir (móvil)
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: torneo?.nombre || 'Torneo ARES'
        })
        return
      } catch (e) {}
    }

    // 💾 descarga normal
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `torneo-${torneo?.nombre || 'ARES'}.jpg`
    link.click()

  } catch (error) {
    console.error('Error al generar imagen:', error)
  }
}

  //
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050f0c] text-white">
        <p className="text-[#10b981] animate-pulse uppercase tracking-widest text-sm">Cargando torneo...</p>
      </div>
    )
  }

  if (!torneo) {
    return (
      <div className="min-h-screen bg-[#050f0c] flex flex-col items-center justify-center text-white">
        <p className="text-red-400 uppercase tracking-widest text-sm mb-4">Torneo no encontrado</p>
        <Link href="/" className="text-[#10b981] font-black text-[10px] uppercase tracking-widest">
          ← Volver al Radar
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050f0c] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Navegación + Botón Descargar */}
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-[#10b981] font-black text-[10px] uppercase tracking-[0.3em] inline-block hover:opacity-70 transition-all"
          >
            ← Regresar al Radar
          </Link>
          
          {/* ✅ BOTÓN DESCARGAR JPG */}
          <button
            onClick={descargarComoJPG}
            className="bg-white/10 border border-white/20 text-white font-black text-[10px] uppercase px-6 py-3 rounded-xl tracking-widest hover:bg-[#10b981] hover:text-black hover:border-[#10b981] transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Descargar JPG</span>
          </button>
        </div>

        {/* ✅ CONTENEDOR QUE SE CAPTURA */}
        <div id="torneo-content" className="space-y-12">
          
          {/* HEADER */}
          <div>
            <span className="text-[#10b981] text-[10px] font-black uppercase tracking-[0.3em]">
              Torneo Oficial ARES
            </span>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mt-2">
              {torneo.nombre}
            </h1>

            {torneo.descripcion && (
            <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden mt-6">
            <div className="p-6 border-b border-white/10">
          <h2 className="text-[#10b981] font-black text-xl uppercase tracking-tighter">
            Descripción del Torneo
         </h2>
            </div>
            <div className="p-6">
          <p className="text-white/60 text-sm uppercase tracking-wider leading-relaxed">
        {torneo.descripcion}
           </p>
            </div>
            </div>
          )}

          </div>

          {/* TABLA GENERAL */}
          <div className="bg-white/5 rounded-3xl border border-white/10 overflow-x-auto">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-[#10b981] font-black text-xl uppercase tracking-tighter">
                Tabla General
              </h2>
            </div>

            {equipos.length > 0 ? (
              <table className="w-full text-left min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-[10px] font-black text-gray-500">Pos</th>
                    <th className="p-4 text-[10px] font-black text-gray-500">Equipo</th>
                    <th className="p-4 text-[10px] font-black text-gray-500">PJ</th>
                    <th className="p-4 text-[10px] font-black text-gray-500">G</th>
                    <th className="p-4 text-[10px] font-black text-gray-500">E</th>
                    <th className="p-4 text-[10px] font-black text-gray-500">P</th>
                    <th className="p-4 text-[10px] font-black text-gray-500">GF</th>
                    <th className="p-4 text-[10px] font-black text-gray-500">GC</th>
                    <th className="p-4 text-[10px] font-black text-gray-500">DG</th>
                    <th className="p-4 text-[10px] font-black text-gray-500">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {equipos.map((eq, i) => (
                    <tr key={eq.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-black text-[#10b981]">{i + 1}</td>
                      <td className="p-4 font-black uppercase">{eq.nombre}</td>
                      <td className="p-4">{eq.partidos_jugados || 0}</td>
                      <td className="p-4">{eq.ganados || 0}</td>
                      <td className="p-4">{eq.empatados || 0}</td>
                      <td className="p-4">{eq.perdidos || 0}</td>
                      <td className="p-4">{eq.goles_favor || 0}</td>
                      <td className="p-4">{eq.goles_contra || 0}</td>
                      <td className="p-4 font-mono">{eq.diferencia || 0}</td>
                      <td className="p-4 font-black">{eq.puntos || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-20 text-center">
                <p className="text-white/20 font-black uppercase text-xs tracking-widest">
                  No hay equipos registrados
                </p>
              </div>
            )}
          </div>

         {/* TABLA GOLEO */}
{goleadores.length > 0 && (
  <div className="bg-white/5 rounded-3xl border border-white/10 overflow-x-auto">
    <div className="p-6 border-b border-white/10">
      <h2 className="text-purple-400 font-black text-xl uppercase tracking-tighter">
        Tabla de Goleo
      </h2>
    </div>

    <table className="w-full text-left min-w-[600px]">
      <thead>
        <tr className="border-b border-white/10">
          <th className="p-6 text-[10px] font-black text-gray-500">Pos</th>
          <th className="p-6 text-[10px] font-black text-gray-500">Jugador</th>
          <th className="p-6 text-[10px] font-black text-gray-500">Equipo</th>
          <th className="p-6 text-[10px] font-black text-gray-500 text-center">Goles</th>
        </tr>
      </thead>
      <tbody>
        {goleadores.map((g, i) => (
          <tr key={g.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="p-6 font-black text-purple-400">{i + 1}</td>
            <td className="p-6 font-black uppercase whitespace-nowrap">{g.nombre_jugador}</td>
            <td className="p-6 text-gray-400 whitespace-nowrap">{g.equipos?.nombre}</td>
            <td className="p-6 text-center font-black text-xl">{g.goles}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

          {/* Footer */}
          <div className="pt-12 border-t border-white/5 text-center">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
              ARES FUTBOL LEÓN · SISTEMA RADAR V2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}