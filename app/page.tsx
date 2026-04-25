'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from './lib/supabase'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ---------------------------------------------------------------- 
// CONFIGURACIÓN DINÁMICA DEL MAPA
// ----------------------------------------------------------------
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#051a14] flex items-center justify-center font-black text-[#10b981] animate-pulse uppercase tracking-[0.3em]">
      Cifrando Radar ARES...
    </div>
  )
})

export default function AresApp() {
  const router = useRouter()
  // --- ESTADOS ---
  const [view, setView] = useState<'jugador' | 'socio'>('jugador')
  const [coords, setCoords] = useState({ lat: 21.1222, lng: -101.6712 })
  const [nombreTemp, setNombreTemp] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [sedes, setSedes] = useState<any[]>([])
  const [mostrarOpciones, setMostrarOpciones] = useState(false)
  const [aceptoTerminos, setAceptoTerminos] = useState(false) //terminos
  const [user, setUser] = useState<any>(null)

  const currentYear = new Date().getFullYear();

  // --- DATA FETCHING ---
  const fetchSedes = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)

    const { data } = await supabase
      .from('sedes')
      .select('*')
      .order('clicks', { ascending: false })
    
    if (data) setSedes(data)
  }

  useEffect(() => {
    fetchSedes()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [view])

  // --- LÓGICA DE FILTRADO Y RANKING ---
  const sedesFiltradas = useMemo(() => {
    return sedes.filter(s =>
      s.nombre.toLowerCase().includes(query.toLowerCase()) ||
      s.ubicacion_texto.toLowerCase().includes(query.toLowerCase())
    )
  }, [query, sedes])

  const sedesDestacadas = useMemo(() => {
    return sedes.filter(s => s.es_destacada === true)
  }, [sedes])

  const topSedes = useMemo(() => 
    [...sedes].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5), 
  [sedes])

  const misSedes = useMemo(() => {
    if (!user) return []
    return sedes.filter(s => s.user_id === user.id)
  }, [sedes, user])

  // --- HANDLERS ---
  const manejarBusqueda = async (valor: string) => {
    setQuery(valor)
    const sedeEncontrada = sedes.find(s => 
      s.nombre.toLowerCase().trim() === valor.toLowerCase().trim()
    )
    if (sedeEncontrada) {
      setCoords({ lat: parseFloat(sedeEncontrada.latitud), lng: parseFloat(sedeEncontrada.longitud) })
      return;
    }
    if (valor.length > 5) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(valor)}, Leon, Guanajuato&limit=1`)
        const data = await res.json()
        if (data && data[0]) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
        }
      } catch (error) {
        console.error("Error radar:", error)
      }
    }
  }

  const eliminarSede = async (id: string, nombre: string) => {
  if (!confirm(`¿Estás seguro de eliminar la sede "${nombre}"? Esta acción borrará también todos sus torneos, equipos y goleadores. NO se puede deshacer.`)) return

  const { error } = await supabase
    .from('sedes')
    .delete()
    .eq('id', id)

  if (error) {
    alert('Error al eliminar la sede: ' + error.message)
    return
  }

  alert(`Sede "${nombre}" eliminada correctamente`)
  fetchSedes()
}

 const guardarSede = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setLoading(true)

  const formData = new FormData(e.currentTarget)

  const nombreSede = formData.get('nombre') as string

 const deporte = "cancha futbol";
  const ubicacion = "leon guanajuato";
  
  // Combinamos todo antes de limpiar
  const textoParaSlug = `${deporte} ${nombreSede} ${ubicacion}`;

  const slug = textoParaSlug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  // 🔐 OBTENER SESIÓN REAL (CLAVE)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    alert("Debes iniciar sesión primero")
    setLoading(false)
    return
  }

 const { error } = await supabase.from('sedes').insert([{
  nombre: nombreSede,
  slug: slug,
  ubicacion_texto: query,
  contacto_whatsapp: formData.get('whatsapp'),
  descripcion: formData.get('descripcion'),
  latitud: coords.lat,
  longitud: coords.lng,
  clicks: 0,
  user_id: session.user.id, // LA LINEA QUE MANDA
  acepto_terminos: true,
  fecha_aceptacion: new Date().toISOString()
}])

  if (!error) {
    alert("UNIDAD INDEXADA EN ARES 2026")
    window.location.reload()
  }

  setLoading(false)
}

  return (
    <div className="min-h-screen bg-[#051a14] flex flex-col items-center font-sans p-4 md:p-8 text-gray-900">

      {/* ESTADO SOCIO */}
      {user && (
        <div className="w-full max-w-7xl bg-[#10b981] p-3 rounded-2xl mb-6 flex justify-between items-center shadow-lg border-b-4 border-black/20">
          <p className="text-black font-black uppercase text-[10px] tracking-widest ml-4 italic">Socio Autorizado: {user.email}</p>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className="text-black/60 hover:text-black font-black uppercase text-[9px] tracking-widest mr-4 transition-colors">[ Cerrar Sesión ]</button>
        </div>
      )}

      {/* HEADER */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
        <div className="relative">
          <h1 className="text-white text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">ARES <span className="text-[#10b981]">FUTBOL</span></h1>
          <p className="text-green-400 text-[8px] font-bold uppercase tracking-[0.6em] mt-2 ml-1 opacity-70">Football Index</p>
        </div>

        <div className="flex-1 max-w-xl w-full bg-black border border-[#10b981]/20 rounded-2xl h-20 flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-2xl">
          <a href="https://youtu.be/4YhJhasdElQ?si=Vquew_Lk3q2AiIRl" target="_blank" className="w-full h-full flex items-center justify-center">
            <img src="/publicidad.png" alt="Sponsor" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<p class="text-[#10b981] font-black text-[10px] uppercase tracking-[0.4em]">Publicidad Disponible</p>'; }} />
          </a>
        </div>

        <button onClick={() => { setView(view === 'jugador' ? 'socio' : 'jugador'); setQuery(''); setMostrarOpciones(false); }} className="bg-[#10b981] text-black font-black uppercase text-[10px] px-8 py-4 rounded-full tracking-widest hover:scale-105 transition-all">
          {view === 'jugador' ? (user ? 'CREAR SEDE' : 'ENTRADA SOCIO') : 'VOLVER AL RADAR'} {/* CAMBIO DE ADMIN. por CREAR */}
        </button>
      </header>

      {/* SEDES DESTACADAS (SIN MODIFICACIONES) */}
      {view === 'jugador' && sedesDestacadas.length > 0 && (
        <div className="w-full max-w-6xl mb-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="h-[2px] w-10 bg-yellow-500"></span>
            <h3 className="text-yellow-500 font-black uppercase text-[10px] tracking-[0.3em]">Sedes Destacadas ARES</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sedesDestacadas.map((s) => (
              <div key={`fav-${s.id}`} className="bg-white/5 border border-yellow-500/30 p-6 rounded-[2.5rem] flex flex-col gap-4 group hover:bg-white/10 transition-all border-b-[6px] border-yellow-500 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-black italic uppercase text-xl leading-none">{s.nombre}</p>
                    <p className="text-gray-500 text-[9px] font-bold uppercase mt-1 tracking-wider">{s.ubicacion_texto}</p>
                  </div>
                  <div className="bg-yellow-500 text-black p-2 rounded-full scale-75 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                  </div>
                </div>
                <a href={`/sede/${s.slug}`} className="text-xs text-white/40 hover:text-white transition-colors underline decoration-yellow-500/20">Ver más detalle</a>
                <a href={`https://wa.me/52${s.contacto_whatsapp}`} target="_blank" className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg">
                  <span className="font-black uppercase text-[10px] tracking-widest">Contactar Sede</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RADAR Y FORMULARIO */}
      <div className="w-full max-w-6xl bg-white rounded-[50px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] grid grid-cols-1 md:grid-cols-2 border border-white/5 relative mb-10">
        <div className="p-12 flex flex-col justify-center bg-white relative">
          {view === 'jugador' ? (
            <div className="space-y-6 md:space-y-10">
              <div>
                <span className="inline-block bg-green-100 text-[#10b981] font-black uppercase text-[10px] px-3 py-1 rounded-full tracking-widest mb-4">Radar Activo</span>
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 uppercase italic leading-[0.85] tracking-tighter">ENCUENTRA <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500 underline decoration-[#10b981] decoration-4 md:decoration-8">TU RETA</span></h2>
              </div>
              <input placeholder="BUSCAR SEDE O COLONIA..." value={query} onChange={(e) => manejarBusqueda(e.target.value)} className="w-full bg-gray-100 border-2 border-gray-200 p-6 rounded-3xl text-gray-900 font-black uppercase italic outline-none focus:border-[#10b981] transition-all text-xl shadow-inner" />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black p-8 rounded-[2.5rem] border-b-8 border-[#10b981]"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Canchas</p><p className="text-5xl font-black text-white italic">{sedesFiltradas.length}</p></div>
                <div className="bg-gray-50 p-8 rounded-[2.5rem] border-b-8 border-gray-200"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Zona</p><p className="text-3xl font-black text-gray-900 italic uppercase">LEÓN</p></div>
              </div>
            </div>
          ) : (
            <form onSubmit={guardarSede} className="space-y-6">
              <h2 className="text-6xl font-black text-gray-900 uppercase italic leading-none tracking-tighter mb-4">ALTA DE <br />SEDE</h2>
              <div className="space-y-4">
                <input name="nombre" placeholder="NOMBRE DE LA SEDE" onChange={(e) => setNombreTemp(e.target.value)} required className="w-full bg-gray-100 border-2 border-gray-200 p-5 rounded-2xl font-black uppercase outline-none focus:border-[#10b981]" />
                <input placeholder="DIRECCIÓN" value={query} onChange={(e) => manejarBusqueda(e.target.value)} required className="w-full bg-gray-100 border-2 border-gray-200 p-5 rounded-2xl font-black uppercase outline-none focus:border-[#10b981]" />
                <input name="whatsapp" placeholder="WHATSAPP (10 DÍGITOS)" required className="w-full bg-gray-100 border-2 border-gray-200 p-5 rounded-2xl font-black uppercase outline-none focus:border-[#10b981]" />
                <textarea name="descripcion" placeholder="DESCRIPCIÓN..." required className="w-full bg-gray-100 border-2 border-gray-200 p-5 rounded-2xl font-black uppercase outline-none focus:border-[#10b981] min-h-[100px]" />
              </div>
              {!mostrarOpciones ? (
  <>
    {/* ✅ CHECKBOX DE TÉRMINOS Y CONDICIONES */}
    {user && (

     <div className="flex items-start gap-2 md:gap-3 my-4">
  <input
    type="checkbox"
    id="terminos"
    checked={aceptoTerminos}
    onChange={(e) => setAceptoTerminos(e.target.checked)}
    className="mt-0.5 w-4 h-4 flex-shrink-0 bg-black border-2 border-[#10b981] rounded focus:ring-[#10b981] focus:ring-2 accent-[#10b981]"
    required
  />
  <label htmlFor="terminos" className="text-white/50 text-[10px] md:text-xs leading-relaxed">
    He leído y acepto los{' '}
    <Link href="/legal" target="_blank" className="text-[#10b981] hover:underline font-bold whitespace-nowrap">
      Términos y Condiciones
    </Link>{' '}
    y la{' '}
    <Link href="/legal" target="_blank" className="text-[#10b981] hover:underline font-bold whitespace-nowrap">
      Política de Privacidad
    </Link>{' '}
    de ARES FUTBOL LEÓN.
  </label>
</div>
    )}
    
    <button 
      type={user ? "submit" : "button"} 
      onClick={() => { if (!user) setMostrarOpciones(true) }} 
      disabled={user && !aceptoTerminos}
      className="w-full bg-black text-white font-black py-7 rounded-3xl hover:bg-[#10b981] transition-all uppercase tracking-[0.3em] text-xs disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {user 
        ? (aceptoTerminos ? 'FINALIZAR REGISTRO' : 'DEBES ACEPTAR LOS TÉRMINOS') 
        : 'REGISTRAR EN RADAR'
      }
    </button>
  </>
) : (
                <div className="bg-[#051a14] p-6 rounded-[2rem] space-y-3 border border-[#10b981]/30">
                  <Link href="/login" className="block w-full bg-[#10b981] text-black text-center py-4 rounded-xl font-black uppercase italic text-[10px] tracking-widest">SOY SOCIO ARES (LOGIN)</Link>
                  <a href="https://wa.me/524774799464?text=Hola,%20quiero%20unirme%20como%20socio%20a%20ARES%20FUTBOL" target="_blank" className="block w-full border-2 border-[#10b981] text-[#10b981] text-center py-4 rounded-xl font-black uppercase italic text-[10px] tracking-widest hover:bg-[#10b981] hover:text-black transition-all">QUIERO UNIRME A ARES</a>
                  <button type="button" onClick={() => setMostrarOpciones(false)} className="w-full text-white/20 text-[8px] font-black uppercase tracking-widest pt-2">[ CANCELAR ]</button>
                </div>
              )}
            </form>
          )}
        </div>
        <div className="h-[600px] md:h-auto min-h-[600px] relative border-l-8 border-gray-50">
          <Map sedes={sedesFiltradas} center={coords} isPicker={view === 'socio'} onLocationSelect={(c: any) => setCoords(c)} nombreSede={nombreTemp} domicilioSede={query} onSedeInteraction={fetchSedes} />
        </div>
      </div>

      {/* SECCIÓN: MIS SEDES REGISTRADAS (SOLUCIÓN: ENVÍA A LA VISTA PÚBLICA DE LA SEDE) */}
      {user && misSedes.length > 0 && (
        <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl overflow-hidden border-t-8 border-[#10b981] mb-10">
          <div className="bg-black p-6 flex justify-between items-center">
            <h3 className="text-white font-black italic uppercase tracking-tighter text-2xl">Mis Unidades Ares</h3>
            <span className="text-[#10b981] font-mono text-[10px] tracking-[0.3em]"> PANEL_CONTROL</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b">
                <tr>
                  <th className="px-8 py-4">Unidad</th>
                  <th className="px-8 py-4">Ubicación</th>

                  <th className="px-8 py-4 text-right">Acción</th>
                  <th className="px-8 py-4 text-right"></th>

                </tr>
              </thead>
              <tbody className="font-black uppercase text-sm">
                {misSedes.map((s) => (
                  <tr key={`mis-sedes-${s.id}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 text-lg tracking-tighter text-gray-900">{s.nombre}</td>
                    <td className="px-8 py-6 text-gray-500 text-xs">{s.ubicacion_texto}</td>

                    <td className="px-2 md:px-4 py-4 md:py-6 text-right">
  <Link 
    href={`/sede/${s.slug}`} 
    className="bg-black text-white text-[8px] md:text-[10px] px-3 md:px-6 py-3 md:py-4 rounded-xl hover:bg-[#10b981] hover:text-black transition-all tracking-widest whitespace-nowrap"
  >
    EDITAR
  </Link>
</td>
<td className="px-2 md:px-4 py-4 md:py-6 text-right">
  <button
    onClick={() => eliminarSede(s.id, s.nombre)}
    className="bg-red-500/20 text-red-400 text-[8px] md:text-[10px] px-3 md:px-4 py-3 md:py-4 rounded-xl hover:bg-red-500 hover:text-white transition-all tracking-widest whitespace-nowrap"
  >
    🗑️
  </button>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RANKING LIGA ARES (SIN MODIFICACIONES) */}
      <div className="w-full max-w-6xl mt-10 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 mb-20">
        <div className="bg-black p-6 flex justify-between items-center">
          <h3 className="text-white font-black italic uppercase tracking-tighter text-2xl">Liga de Sedes ARES {currentYear}</h3>
          <span className="text-[#10b981] font-mono text-[10px] tracking-[0.3em] animate-pulse">LIVE RANKING_</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b">
              <tr>
                <th className="px-8 py-4">Ranking</th>
                <th className="px-8 py-4">Sede / Historial</th>
                <th className="px-8 py-4 text-right">Interacciones</th>
              </tr>
            </thead>
            <tbody className="font-black uppercase text-sm">
              {topSedes.map((s, i) => (
                <tr key={s.id} className={`border-b border-gray-50 transition-colors ${i === 0 ? 'bg-blue-50/50 text-blue-900' : i === 4 ? 'bg-red-50/50 text-red-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <td className="px-8 py-6 italic text-2xl">#{i + 1}</td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-lg tracking-tighter">{s.nombre}</span>
                      {i === 0 && <span className="text-[9px] text-blue-600 tracking-widest mt-1">⭐ Campeón del año {currentYear}</span>}
                      <div className="flex gap-1 mt-1 opacity-60">
                        {s.campeonatos ? s.campeonatos.split(',').map((year: string) => (
                          <span key={year} className="text-[8px] bg-gray-200 px-1.5 py-0.5 rounded text-black font-bold">STARS {year.trim()}</span>
                        )) : <span className="text-[8px] tracking-widest text-gray-400">Sin títulos previos</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-mono text-xl">{s.clicks || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER CORPORATIVO (SIN MODIFICACIONES) */}
      <footer className="w-full max-w-6xl mt-auto mb-8 flex flex-col md:flex-row justify-between items-center border-t border-white/10 pt-8 gap-6">
        <div className="flex flex-col items-center md:items-start">
          <p className="text-[#10b981] text-[10px] font-black uppercase tracking-[0.8em] mb-2">ARES FOOTBALL INDEX © 2026</p>
          <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Desarrollado por <span className="text-white">GRINBERG</span></p>
        </div>
        <div>
          <h4 className="text-white font-black text-[11px] uppercase tracking-[0.4em] mb-8 text-white/50">Partners</h4>
<Link 
  href="/login" 
  className="text-white/20 text-[10px] font-black uppercase tracking-widest hover:text-[#10b981] transition-colors"
>
  ACCESO SOCIOS _
</Link>
        </div>
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">Para temas de publicidad o ser una Sede Destacada:</p>
          <a href="mailto:proyectogrinberg@gmail.com" className="text-white hover:text-[#10b981] transition-colors font-black text-[11px] uppercase tracking-wider">proyectogrinberg@gmail.com</a>
        </div>
      </footer>
    </div>
  )
}