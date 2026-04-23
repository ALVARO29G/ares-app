'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function CreateUserPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [authorized, setAuthorized] = useState(false)

  const ADMIN_EMAIL = 'ortizalvarogiovanni@gmail.com'

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/')
      } else {
        setAuthorized(true)
      }
    }

    checkUser()
  }, [router])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/create-socio', { // 🔥 CORREGIDO
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setMessage('✅ Usuario creado correctamente')
      setEmail('')
      setPassword('')
    } catch (err: any) {
      setMessage('❌ ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-[#051a14] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-xl">
        
        <h2 className="text-[#10b981] text-2xl font-black uppercase mb-6 text-center">
          ARES / CREAR_SOCIO
        </h2>

        <form onSubmit={handleCreateUser} className="space-y-4">

          <input
            type="email"
            placeholder="correo@socio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/40 border border-white/10 p-4 pr-12 rounded-xl text-white"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#10b981]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#10b981] text-black py-4 rounded-xl font-black"
          >
            {loading ? 'CREANDO...' : 'CREAR USUARIO'}
          </button>

          {message && (
            <p className="text-center text-xs mt-4 text-white/70">
              {message}
            </p>
          )}

        </form>
      </div>
    </div>
  )
}