import { MetadataRoute } from 'next'
import { createSupabaseServer } from '@/app/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createSupabaseServer()
  
  // Obtener todas las sedes
  const { data: sedes } = await supabase
    .from('sedes')
    .select('slug, clicks, created_at')
    .order('clicks', { ascending: false })

  // Obtener todos los torneos (opcional, para indexarlos también)
  const { data: torneos } = await supabase
    .from('torneos')
    .select('id, nombre, created_at')

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // URLs de sedes
  const sedesUrls = sedes?.map((sede) => ({
    url: `${baseUrl}/sede/${sede.slug}`,
    lastModified: sede.created_at ? new Date(sede.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || []

  // URLs de torneos (opcional)
  const torneosUrls = torneos?.map((torneo) => ({
    url: `${baseUrl}/torneo/${torneo.id}`,
    lastModified: torneo.created_at ? new Date(torneo.created_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  })) || []

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    ...sedesUrls,
    ...torneosUrls,
  ]
}