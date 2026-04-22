'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function PanelSocio() {
  const [torneos, setTorneos] = useState<any[]>([])
  const [perfil, setPerfil] = useState<any>(null)
  const [nombreNuevo, setNombreNuevo] = useState('')

  useEffect(() => {
    const cargarDatos = async () => {
      // 1. Obtener el usuario logueado
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 2. Obtener su perfil de socio (su sede_id)
      const { data: perfilSocio } = await supabase
        .from('perfiles_socios')
        .select('sede_id')
        .eq('id', user.id)
        .single()
      
      setPerfil(perfilSocio)

      // 3. Cargar solo los torneos de SU sede
      if (perfilSocio) {
        const { data } = await supabase
          .from('torneos')
          .select('*')
          .eq('sede_id', perfilSocio.sede_id)
        setTorneos(data || [])
      }
    }
    cargarDatos()
  }, [])

  const crearTorneo = async () => {
    if (!nombreNuevo || !perfil) return
    const { error } = await supabase
      .from('torneos')
      .insert([{ nombre: nombreNuevo, sede_id: perfil.sede_id }])
    
    if (!error) {
      setNombreNuevo('')
      // Refrescar lista
      const { data } = await supabase.from('torneos').select('*').eq('sede_id', perfil.sede_id)
      setTorneos(data || [])
    }
  }

  return (
    <div className="min-h-screen bg-[#051a14] p-8 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black italic tracking-tighter text-[#10b981]">PANEL SOCIO ARES</h1>
          <button 
            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
            className="text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100"
          >
            Cerrar Sesión
          </button>
        </header>

        {/* Formulario de creación */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] mb-12">
          <h2 className="text-sm font-black uppercase tracking-widest mb-4">Nuevo Torneo</h2>
          <div className="flex gap-4">
            <input 
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              placeholder="NOMBRE DEL TORNEO (EJ. LIGA NOCTURNA)"
              className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 flex-1 text-xs font-bold uppercase"
            />
            <button onClick={crearTorneo} className="bg-[#10b981] text-black font-black px-10 py-4 rounded-2xl uppercase text-[10px] hover:scale-105 transition-all">
              Crear
            </button>
          </div>
        </div>

        {/* Lista de Torneos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {torneos.map(t => (
            <a href={`/socio/torneo/${t.id}`} key={t.id} className="group bg-white/5 p-10 rounded-[3rem] border border-white/5 hover:border-[#10b981]/50 transition-all">
              <span className="text-[#10b981] text-[9px] font-black uppercase tracking-widest">Gestionar</span>
              <h3 className="text-3xl font-black uppercase italic mt-2">{t.nombre}</h3>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}