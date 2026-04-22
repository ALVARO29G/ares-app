import { createSupabaseServer, getUserOnServer } from '@/app/lib/supabase'
import { redirect } from 'next/navigation'

export async function POST(req: Request) {
  const supabase = await createSupabaseServer()
  const user = await getUserOnServer()

  if (!user) redirect('/login')

  const formData = await req.formData()
  const nombre = formData.get('nombre') as string
  const sede_id = formData.get('sede_id') as string

  // 🔍 Validar sede
  const { data: sede } = await supabase
    .from('sedes')
    .select('*')
    .eq('id', sede_id)
    .maybeSingle()

  if (!sede || sede.user_id !== user.id) {
    throw new Error('No autorizado')
  }

  // ✅ Crear torneo
  const { error } = await supabase
    .from('torneos')
    .insert({
      nombre,
      sede_id
    })

  if (error) {
    console.error(error)
    throw new Error('Error creando torneo')
  }

  // 🔁 Redirigir a sede
  redirect(`/sede/${sede.slug}`)
}