//https://canchasleon.com/admin/create-user

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // 1. Crear usuario en auth
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

    if (userError) throw userError

    const user = userData.user

    // 2. Crear perfil en tu tabla
    const { error: profileError } = await supabaseAdmin
      .from('perfiles_socios')
      .insert([
        {
          id: user.id, // 🔥 IMPORTANTE
          plan_type: 'free'
        }
      ])

    if (profileError) throw profileError

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    )
  }
}