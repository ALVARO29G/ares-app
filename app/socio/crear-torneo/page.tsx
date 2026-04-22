import { createSupabaseServer, getUserOnServer } from '@/app/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CrearTorneoPage({ searchParams }: { searchParams: Promise<{ sede: string }> }) {
  const resolvedSearch = await searchParams
  const sedeId = resolvedSearch.sede

  const supabase = await createSupabaseServer()
  const user = await getUserOnServer()

  // 🔐 Protección
  if (!user) redirect('/login')

  const { data: sede } = await supabase
    .from('sedes')
    .select('*')
    .eq('id', sedeId)
    .maybeSingle()

  if (!sede || sede.user_id !== user.id) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#051a14] text-white px-6 py-12 md:px-12">
      <div className="max-w-4xl mx-auto">

        {/* NAV */}
        <div className="mb-10">
          <Link
            href={`/sede/${sede.slug}`}
            className="text-[#10b981] text-[10px] uppercase tracking-[0.3em] font-black hover:opacity-70 transition"
          >
            ← Volver a la sede
          </Link>
        </div>

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-[#10b981] text-[10px] uppercase tracking-[0.4em] font-black mb-3 opacity-70">
            Panel de gestión
          </p>
          <h1 className="text-4xl md:text-6xl font-[1000] italic uppercase tracking-tighter leading-none">
            Crear Torneo
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-3">
            {sede.nombre}
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

          <form
            action="/socio/crear-torneo/create"
            method="POST"
            className="flex flex-col gap-6"
          >

            {/* NOMBRE */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">
                Nombre del torneo
              </label>

              <input
                name="nombre"
                placeholder="Ej: Liga Nocturna 7v7"
                required
                className="w-full p-5 rounded-2xl bg-black/60 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              />
            </div>

            {/* HIDDEN */}
            <input type="hidden" name="sede_id" value={sede.id} />

            {/* ACTIONS */}
            <div className="flex flex-col md:flex-row gap-4 pt-4">

              <button
                type="submit"
                className="flex-1 bg-[#10b981] text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
              >
                Crear torneo
              </button>

              <Link
                href={`/sede/${sede.slug}`}
                className="flex-1 md:flex-none text-center border border-white/10 py-4 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
              >
                Cancelar
              </Link>

            </div>
          </form>
        </div>

        <p className="text-center text-white/20 text-[10px] uppercase tracking-widest mt-10">
          El torneo aparecerá automáticamente en la sede
        </p>

      </div>
    </div>
  )
}