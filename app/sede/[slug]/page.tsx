import { createSupabaseServer, getUserOnServer } from '@/app/lib/supabase'
import { Metadata } from 'next'
import { TablaPublica } from '../../components/TablaPublica'
import Link from 'next/link'
import { cookies, headers } from 'next/headers'

export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const slug = decodeURIComponent(resolvedParams.slug).trim()

  const supabase = await createSupabaseServer()
  const { data: sede } = await supabase
    .from('sedes')
    .select('nombre, ubicacion_texto')
    .eq('slug', slug)
    .maybeSingle()

  return {
    title: `${sede?.nombre || 'Sede'} | ARES FUTBOL LEÓN`,
    description: `Agenda tu reta en ${sede?.nombre}. Ubicada en ${sede?.ubicacion_texto}. La mejor experiencia de fútbol en León.`
  }
}

export default async function SedePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const slugLimpio = decodeURIComponent(resolvedParams.slug || '').trim().toLowerCase()

  // --- DIAGNÓSTICO COMPLETO ---
  const cookieStore = await cookies()
  const headersList = await headers()

  const allCookies = cookieStore.getAll()
  const supabaseCookie = allCookies.find(c => c.name.includes('sb-') && c.name.endsWith('-auth-token'))

  let cookieToken: string | null = null
  let cookieParsed: any = null
  if (supabaseCookie) {
    try {
      cookieParsed = JSON.parse(decodeURIComponent(supabaseCookie.value))
      cookieToken = cookieParsed?.access_token || null
    } catch (e) {
      cookieParsed = { error: 'No se pudo parsear' }
    }
  }

  const authHeader = headersList.get('authorization')
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  // 1. Cliente server
  const supabase = await createSupabaseServer()

  // 2. Obtener usuario con nuestra función robusta
  const user = await getUserOnServer()

  // 3. Obtener sede
  const { data: sede, error } = await supabase
    .from('sedes')
    .select('*')
    .eq('slug', slugLimpio)
    .maybeSingle()

  // 4. Torneos
  const { data: torneosData } = sede
  ? await supabase.from('torneos').select('*').eq('sede_id', sede.id)
  : { data: [] }

  const torneos = { data: torneosData || [] }

  // 5. Validación de dueño
  const userId = user?.id || null
  const sedeOwnerId = sede?.user_id || null
  const esDuenio = !!(userId && sedeOwnerId && userId === sedeOwnerId)

  // 6. Analytics
  if (sede) {
    await supabase
  .from('sedes')
  .update({ clicks: (sede.clicks || 0) + 1 })
  .eq('id', sede.id)
  .select()
  }

  if (error || !sede) {
    return (
      <div className="min-h-screen bg-[#051a14] flex flex-col items-center justify-center p-10 text-center">
        <h1 className="text-[#10b981] font-black text-4xl mb-4 italic uppercase">
          Sede fuera de rango
        </h1>
        <p className="text-white/40 text-xs uppercase tracking-[0.2em]">
          El radar no detectó el slug: {slugLimpio}
        </p>
        <Link
          href="/"
          className="mt-10 border border-[#10b981] px-8 py-3 rounded-full text-[10px] font-black text-[#10b981] hover:bg-[#10b981] hover:text-black transition-all"
        >
          REINTENTAR BUSQUEDA
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#051a14] text-white font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
       
        

        {/* Barra de gestión */}
        {esDuenio && (
          <div className="mb-10 bg-[#10b981] p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between shadow-[0_0_50px_rgba(16,185,129,0.2)] border-2 border-black/5">
            <div className="flex flex-col mb-4 md:mb-0">
              <span className="text-black font-black uppercase text-[10px] tracking-widest opacity-60">
                Gestión de Unidad:
              </span>
              <h2 className="text-black font-[1000] uppercase italic text-4xl leading-tight tracking-tighter">
                {sede.nombre}
              </h2>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <Link
                href={`/socio/editar/${sede.slug}`}
                className="flex-1 md:flex-none bg-black text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all text-center"
              >
                EDITAR DESCRIPCIÓN
              </Link>
              <Link
                href={`/socio/crear-torneo?sede=${sede.id}`}
                className="flex-1 md:flex-none bg-white text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all text-center shadow-md"
              >
                CREAR TORNEO
              </Link>
              <button className="text-black hover:opacity-50 transition-all ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Resto de la página (sin cambios) */}
        <nav className="mb-12">
          <Link
            href="/"
            className="text-[#10b981] font-black text-[10px] uppercase tracking-[0.3em] inline-block hover:opacity-70 transition-all"
          >
            ← Regresar al Radar
          </Link>
        </nav>

        <header className="mb-12">
          <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8] mb-6">
            {sede.nombre}
          </h1>
          <div className="flex items-center gap-4">
            <span className="bg-[#10b981] text-black font-black text-[10px] px-4 py-1.5 rounded-full uppercase italic shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              Verified Sede 2026
            </span>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest italic">
              Ubicación: {sede.ubicacion_texto}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-sm">
              <h3 className="text-[#10b981] font-black uppercase text-[10px] mb-6 tracking-[0.4em]">
                Reporte de Instalaciones
              </h3>
              <p className="text-gray-200 leading-snug italic text-2xl font-bold">
                "{sede.descripcion || 'Sin reporte técnico disponible.'}"
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-white font-black uppercase text-[10px] px-6 tracking-[0.4em] opacity-40">
                Competencias en curso
              </h3>

              {torneos.data && torneos.data.length > 0 ? (
                torneos.data.map((torneo: any) => (
                  <div
                    key={torneo.id}
                    className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-md"
                  >
                    {/* Vista torneo */}
                   <div className="flex justify-between items-center mb-8 px-2">
  <h4 className="text-3xl font-black uppercase italic tracking-tighter text-[#10b981]">
    {torneo.nombre}
  </h4>
  <div className="flex gap-2">
    {esDuenio && (
      <Link
        href={`/socio/panel/torneo/${torneo.id}`}
        className="text-[15px] font-black uppercase bg-[#10b981] text-black px-3 py-1 rounded-lg hover:bg-white transition-colors"
      >
        EDITAR
      </Link>
    )}
      {/* BOTÓN VER - Visible para TODOS */}
    <Link
      href={`/torneo/${torneo.id}`}
      className="text-[30px] font-black uppercase bg-white/10 text-white px-3 py-1 rounded-lg hover:bg-white hover:text-black transition-colors"
    >
      VER
    </Link>
  </div>
</div>

                  </div>
                ))
              ) : (
                <div className="bg-white/5 border border-dashed border-white/10 p-20 rounded-[3rem] text-center">
                  <p className="text-white/20 font-black uppercase text-[10px] tracking-widest">
                    No hay torneos registrados
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[3.5rem] overflow-hidden border-2 border-white/5 h-[500px] shadow-2xl relative">
              <iframe
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter: 'invert(90%) hue-rotate(150deg) brightness(0.8) contrast(1.2)'
                }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${sede.latitud},${sede.longitud}&z=16&output=embed`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-[#04211a] border border-white/5 p-10 rounded-[4rem] text-white flex flex-col justify-between shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
              <div>
                <p className="font-black text-[11px] uppercase tracking-[0.3em] mb-8 opacity-30 text-center text-white/50">
                  Protocolo de Reserva
                </p>
                <a
                  href={`https://wa.me/52${sede.contacto_whatsapp}?text=Hola!%20Vi%20la%20sede%20${encodeURIComponent(sede.nombre)}%20en%20el%20Radar%20ARES%20y%20quiero%20información.`}
                  target="_blank"
                  className="block w-full bg-[#10b981] text-black text-center py-7 rounded-3xl font-black text-xl uppercase tracking-widest hover:bg-white transition-all shadow-[0_15px_30px_rgba(16,185,129,0.2)]"
                >
                  WHATSAPP
                </a>
              </div>
              <p className="text-[10px] text-center font-black uppercase mt-8 leading-tight text-white/30 tracking-tighter">
                Al contactar, menciona que vienes de{' '}
                <span className="text-[#10b981]">ARES LEÓN</span>
              </p>
            </div>

            <div className="bg-[#10b981] p-10 rounded-[4rem] text-black">
              <p className="font-black text-[10px] uppercase tracking-widest mb-2 opacity-60 italic">
                Popularidad Radar
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-[1000] italic leading-none tracking-tighter">
                  {sede.clicks || 0}
                </span>
                <span className="font-black uppercase text-sm">Hits</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-40 border-t border-white/5 pt-20 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="lg:col-span-2">
              <h2 className="text-[#10b981] font-black text-3xl italic uppercase tracking-tighter mb-6">
                ARES FUTBOL LEÓN
              </h2>
              <p className="text-white/40 text-[10px] font-black uppercase leading-relaxed tracking-widest max-w-sm">
                La plataforma de indexación y radar de sedes más avanzada de la región.
                Conectando talento con infraestructura deportiva de alto rendimiento.
              </p>
            </div>

            <div>
              <h4 className="text-white font-black text-[11px] uppercase tracking-[0.4em] mb-8 text-white/50">
                Partners
              </h4>
              <Link
                href="/login"
                className="text-white/20 text-[10px] font-black uppercase tracking-widest hover:text-[#10b981] transition-colors"
              >
                ACCESO SOCIOS _
              </Link>
            </div>

            <div>
              <h4 className="text-white font-black text-[11px] uppercase tracking-[0.4em] mb-8 text-white/50">
                System Status
              </h4>
              <div className="flex flex-col gap-2">
                <span className="text-[#10b981] text-[10px] font-mono">
                  ● SYSTEM_ONLINE
                </span>
                <span className="text-white/20 text-[9px] font-mono uppercase tracking-tighter text-white/30">
                  Leon_Gto_2026.v2
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}