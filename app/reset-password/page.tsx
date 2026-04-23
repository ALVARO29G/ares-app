'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  // 🔥 evita errores de prerender
  useEffect(() => {
    setMounted(true)

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setHasSession(true)
      }
    }

    checkSession()
  }, [])

  if (!mounted) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }

    setLoading(false)
  }

  if (!hasSession && !success) {
    return (
      <div className="min-h-screen bg-[#051a14] flex flex-col items-center justify-center p-6 text-white">
        <p className="text-red-400 uppercase tracking-widest text-sm mb-4">
          Enlace inválido o expirado
        </p>
        <Link
          href="/login"
          className="text-[#10b981] font-black text-[10px] uppercase tracking-widest"
        >
          ← Volver al Login
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#051a14] flex flex-col items-center justify-center p-6">
      <Link
        href="/"
        className="mb-8 text-[#10b981] font-black text-[10px] uppercase tracking-[0.3em] hover:opacity-50 transition-all"
      >
        ← VOLVER AL RADAR
      </Link>

      <div className="max-w-md w-full bg-white/5 border border-white/10 p-12 rounded-[3rem] backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <h2 className="text-[#10b981] font-[1000] text-3xl italic uppercase tracking-tighter mb-10 text-center leading-none">
          ARES / <span className="text-white">NUEVA CLAVE</span>
        </h2>

        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] p-6 rounded-2xl">
              <p className="font-black uppercase text-sm">
                ✅ Contraseña actualizada
              </p>
              <p className="text-xs mt-2 opacity-70">
                Redirigiendo al login...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[9px] text-[#10b981] font-black ml-4 uppercase tracking-widest">
                Nueva Access_Key
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="NUEVA CONTRASEÑA"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 pr-14 text-white font-mono text-xs focus:border-[#10b981] outline-none transition-all placeholder:text-white/10"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#10b981]/60 hover:text-[#10b981] transition-all"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-[#10b981] font-black ml-4 uppercase tracking-widest">
                Confirmar Clave
              </label>

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="CONFIRMAR CONTRASEÑA"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-mono text-xs focus:border-[#10b981] outline-none transition-all placeholder:text-white/10"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-[10px] font-mono uppercase text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10b981] text-black font-[1000] py-5 rounded-2xl uppercase italic tracking-[0.2em] hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_30px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:scale-100"
            >
              {loading ? 'ACTUALIZANDO...' : 'GUARDAR CLAVE'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}