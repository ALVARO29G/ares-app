'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  
  // Modo: 'login' o 'reset'
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  
  // Campos de login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Estados
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // ========== LOGIN ==========
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  // ========== RECUPERACIÓN ==========
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Ingresa tu correo electrónico')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(`Hemos enviado un enlace de recuperación a ${email}. Revisa tu bandeja de entrada.`)
      setPassword('')
    }

    setLoading(false)
  }

  // ========== VOLVER AL LOGIN ==========
  const volverAlLogin = () => {
    setMode('login')
    setError(null)
    setSuccess(null)
    setPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020807] relative overflow-hidden px-6">
      {/* FONDO ARES */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.08),transparent_50%)]" />

      <div className="w-full max-w-md z-10">
        {/* NAV */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-10 text-[#10b981] text-[10px] font-black uppercase tracking-[0.35em] hover:opacity-60 transition group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>VOLVER_AL_RADAR</span>
        </Link>

        {/* PANEL PRINCIPAL */}
        <div className="bg-[#061411] border border-[#10b981]/20 rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)]">
          
          {/* HEADER DINÁMICO */}
          <div className="mb-8">
            <h1 className="text-3xl font-black italic tracking-tight">
              <span className="text-[#10b981]">ARES</span>
              <span className="text-white"> / SOCIO</span>
            </h1>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mt-2">
              {mode === 'login' ? 'AUTH SYSTEM' : 'RECOVERY MODE'}
            </p>
          </div>

          {/* MODO LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* EMAIL */}
              <div>
                <label className="text-[9px] text-[#10b981] uppercase tracking-[0.3em] font-black">
                  USER_ID
                </label>
                <input
                  type="email"
                  placeholder="correo_electronico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-2 bg-[#020807] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/40 outline-none transition placeholder:text-white/20"
                  required
                  disabled={loading}
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-[9px] text-[#10b981] uppercase tracking-[0.3em] font-black">
                  ACCESS_KEY
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="password_key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#020807] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white text-sm focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/40 outline-none transition placeholder:text-white/20"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-[#10b981]/20 transition"
                  >
                    {showPassword ? (
                      <EyeOff size={16} className="text-white/70" />
                    ) : (
                      <Eye size={16} className="text-white/70" />
                    )}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-[10px] uppercase tracking-wider">
                  ⚠ {error}
                </div>
              )}

              {/* BOTÓN VERIFICAR */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10b981] text-black font-black py-3 rounded-xl uppercase tracking-[0.25em] text-sm hover:bg-[#0ea574] active:scale-95 transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                {loading ? 'VERIFICANDO...' : 'VERIFICAR'}
              </button>

              {/* ENLACE A RECUPERACIÓN */}
              <button
                type="button"
                onClick={() => {
                  setMode('reset')
                  setError(null)
                }}
                className="w-full text-center text-[9px] text-white/20 hover:text-[#10b981] font-black uppercase tracking-[0.3em] transition-colors py-1"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          )}

          {/* MODO RECUPERACIÓN */}
          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-5">
              {/* EMAIL PARA RECUPERACIÓN */}
              <div>
                <label className="text-[9px] text-[#10b981] uppercase tracking-[0.3em] font-black">
                  CORREO REGISTRADO
                </label>
                <input
                  type="email"
                  placeholder="tu_correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-2 bg-[#020807] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/40 outline-none transition placeholder:text-white/20"
                  required
                  disabled={loading}
                  autoFocus
                />
                <p className="text-[8px] text-white/30 uppercase tracking-wider mt-2">
                  Te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

              {/* ERROR */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-[10px] uppercase tracking-wider">
                  ⚠ {error}
                </div>
              )}

              {/* ÉXITO */}
              {success && (
                <div className="bg-[#10b981]/5 border border-[#10b981]/20 text-[#10b981] p-4 rounded-lg text-[10px] uppercase tracking-wider leading-relaxed">
                  ✓ {success}
                </div>
              )}

              {/* BOTÓN ENVIAR */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10b981] text-black font-black py-3 rounded-xl uppercase tracking-[0.25em] text-sm hover:bg-[#0ea574] active:scale-95 transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
              </button>

              {/* VOLVER AL LOGIN */}
              <button
                type="button"
                onClick={volverAlLogin}
                className="w-full text-center text-[9px] text-white/20 hover:text-[#10b981] font-black uppercase tracking-[0.3em] transition-colors py-1"
              >
                ← Volver al inicio de sesión
              </button>
            </form>
          )}

          {/* TÉRMINOS (SIEMPRE VISIBLE) */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="text-white/30 text-[8px] text-center">
              Al continuar, aceptas nuestros{' '}
              <Link href="/legal" className="text-[#10b981] hover:underline">Términos y Condiciones</Link>.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-[9px] text-white/10 uppercase tracking-[0.4em] font-black mt-8">
          SISTEMA ARES V2.0
        </p>
      </div>
    </div>
  )
}