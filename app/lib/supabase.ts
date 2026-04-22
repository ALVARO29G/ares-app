import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 🔥 CLIENTE PARA NAVEGADOR (IMPORTANTE: usa cookies, no localStorage)
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)

// 🔥 CLIENTE PARA SERVER COMPONENTS
export const createSupabaseServer = async () => {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // En Server Components no siempre se pueden setear cookies
        }
      },
    },
  })
}

// 🔥 FUNCIÓN ROBUSTA PARA OBTENER USUARIO (FIX BASE64)
export const getUserOnServer = async () => {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const supabaseCookie = allCookies.find(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  if (!supabaseCookie) return null

  let accessToken: string | null = null

  try {
    // ✅ quitar prefijo base64-
    const base64 = supabaseCookie.value.replace('base64-', '')

    // ✅ decodificar base64
    const decoded = Buffer.from(base64, 'base64').toString('utf-8')

    const parsed = JSON.parse(decoded)

    accessToken = parsed?.access_token || null
  } catch (e) {
    console.log('Error parsing cookie:', e)
    return null
  }

  if (!accessToken) return null

  // Validar token contra Supabase
  const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })

  const { data, error } = await tempClient.auth.getUser(accessToken)

  if (error) {
    console.log('Error obteniendo usuario:', error.message)
    return null
  }

  return data.user
}