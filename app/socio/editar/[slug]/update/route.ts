import { createSupabaseServer, getUserOnServer } from '@/app/lib/supabase'
import { redirect } from 'next/navigation'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params
  const slug = decodeURIComponent(resolvedParams.slug).trim().toLowerCase()

  const supabase = await createSupabaseServer()
  const user = await getUserOnServer()

  if (!user) redirect('/login')

  const formData = await req.formData()
  const descripcion = formData.get('descripcion') as string

  if (!descripcion) {
    throw new Error('Descripción vacía')
  }

  const { data: sede } = await supabase
    .from('sedes')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!sede || sede.user_id !== user.id) {
    throw new Error('No autorizado')
  }

  const { error } = await supabase
    .from('sedes')
    .update({ descripcion })
    .eq('id', sede.id)

  if (error) {
    console.error(error)
    throw new Error('Error actualizando sede')
  }

  redirect(`/sede/${slug}`)
}