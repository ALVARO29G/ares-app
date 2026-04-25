'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import html2canvas from 'html2canvas'
import * as htmlToImage from 'html-to-image'

type Equipo = {
  id: string
  nombre: string
  puntos: number
  partidos_jugados: number
  ganados: number
  empatados: number
  perdidos: number
  goles_favor: number
  goles_contra: number
  diferencia: number
}

type Goleador = {
  id: string
  nombre_jugador: string
  equipo_id: string
  goles: number
  equipos: { nombre: string }
}

type ToastType = 'success' | 'error' | 'info' | 'warning'

type Toast = {
  id: number
  message: string
  type: ToastType
}

type ConfirmModal = {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  confirmText?: string
  type?: 'danger' | 'warning' | 'info'
}

export default function GestionTorneo() {
  const params = useParams()
  const router = useRouter()
  const torneoId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  const [torneo, setTorneo] = useState<any>(null)
  const [descripcion, setDescripcion] = useState('')

  const [editandoNombre, setEditandoNombre] = useState(false)
  const [nombreTorneo, setNombreTorneo] = useState('')

  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [goleadores, setGoleadores] = useState<Goleador[]>([])

  const [tab, setTab] = useState<'equipos' | 'goleo'>('equipos')

  const [nuevoEquipo, setNuevoEquipo] = useState('')
  const [nuevoJugador, setNuevoJugador] = useState('')
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('')

  const [editingCell, setEditingCell] = useState<{
    type: 'equipo' | 'goleador'
    id: string
    field: string
  } | null>(null)

  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const [toasts, setToasts] = useState<Toast[]>([])

  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirmar',
    type: 'danger'
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'danger') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText: type === 'danger' ? 'Eliminar' : 'Confirmar',
      type
    })
  }

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
  }

  useEffect(() => {
    if (torneoId) init()
  }, [torneoId])

  const init = async () => {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()

    const { data: torneoData } = await supabase
      .from('torneos')
      .select('*')
      .eq('id', torneoId)
      .maybeSingle()

    if (!torneoData) {
      setLoading(false)
      return
    }

    setTorneo(torneoData)
    setDescripcion(torneoData.descripcion || '')
    setNombreTorneo(torneoData.nombre || '') // Para editar el nombre de mi torneo

    if (session) {
      const { data: sede } = await supabase
        .from('sedes')
        .select('user_id')
        .eq('id', torneoData.sede_id)
        .maybeSingle()

      if (sede?.user_id === session.user.id) {
        setIsOwner(true)
      }
    }

    const { data: equiposData } = await supabase
  .from('equipos')
  .select('*')
  .eq('torneo_id', torneoId)
  .order('puntos', { ascending: false })
  .order('diferencia', { ascending: false })
  .order('goles_favor', { ascending: false })

setEquipos(equiposData || [])

await fetchGoleadores(equiposData || [])

    setLoading(false)
  }


  const fetchEquipos = async () => {
    const { data } = await supabase
      .from('equipos')
      .select('*')
      .eq('torneo_id', torneoId)
      .order('puntos', { ascending: false })
      .order('diferencia', { ascending: false })
      .order('goles_favor', { ascending: false })

    setEquipos(data || [])
  }

 const fetchGoleadores = async (equiposList: Equipo[]) => {
  const equiposDelTorneo = equiposList.map(e => e.id)

  if (equiposDelTorneo.length === 0) {
    setGoleadores([])
    return
  }

  const { data } = await supabase
    .from('goleo')
    .select('*, equipos(nombre)')
    .in('equipo_id', equiposDelTorneo)
    .order('goles', { ascending: false })

  setGoleadores(data || [])
}

  const agregarEquipo = async () => {
    if (!nuevoEquipo.trim()) {
      showToast('El nombre del equipo es requerido', 'warning')
      return
    }

    const { error } = await supabase
      .from('equipos')
      .insert([{
        nombre: nuevoEquipo.trim(),
        torneo_id: torneoId,
        puntos: 0,
        partidos_jugados: 0,
        ganados: 0,
        empatados: 0,
        perdidos: 0,
        goles_favor: 0,
        goles_contra: 0,
        diferencia: 0
      }])

    if (error) {
      console.error('Error al agregar equipo:', error)
      showToast('Error al agregar equipo: ' + error.message, 'error')
      return
    }

    showToast(`Equipo "${nuevoEquipo.trim()}" agregado`, 'success')
    setNuevoEquipo('')
    fetchEquipos()
  }

  const eliminarEquipo = async (id: string, nombre: string) => {
    showConfirm(
      'Eliminar Equipo',
      `¿Estás seguro de eliminar el equipo "${nombre}"? Esta acción borrará también todos sus goleadores y no se puede deshacer.`,
      async () => {
        const { error } = await supabase.from('equipos').delete().eq('id', id)

        if (error) {
          console.error('Error al eliminar equipo:', error)
          showToast('Error al eliminar: ' + error.message, 'error')
          return
        }

        showToast(`Equipo "${nombre}" eliminado`, 'success')
        fetchEquipos()
        fetchGoleadores(equipos)
        closeConfirm()
      },
      'danger'
    )
  }

  const updateStat = async (tabla: string, id: string, columna: string, valor: number) => {
    const { error } = await supabase
      .from(tabla)
      .update({ [columna]: valor })
      .eq('id', id)

    if (error) {
      console.error('Error al actualizar:', error)
      showToast('Error al actualizar: ' + error.message, 'error')
      return
    }

    if (tabla === 'equipos') {
      const { data: equipoActual } = await supabase
        .from('equipos')
        .select('goles_favor, goles_contra')
        .eq('id', id)
        .single()

      if (equipoActual) {
        const gf = equipoActual.goles_favor || 0
        const gc = equipoActual.goles_contra || 0
        const diferencia = gf - gc

        await supabase
          .from('equipos')
          .update({ diferencia })
          .eq('id', id)
      }

      fetchEquipos()
      showToast('Estadística actualizada', 'success')
    } else if (tabla === 'goleo') {
      fetchGoleadores(equipos)
      showToast('Goles actualizados', 'success')
    }

    setEditingCell(null)
  }

  const agregarGoleador = async () => {
    if (!nuevoJugador.trim()) {
      showToast('El nombre del jugador es requerido', 'warning')
      return
    }

    if (!equipoSeleccionado) {
      showToast('Debes seleccionar un equipo', 'warning')
      return
    }

    const equipoNombre = equipos.find(e => e.id === equipoSeleccionado)?.nombre

    const { error } = await supabase
      .from('goleo')
      .insert([{
        nombre_jugador: nuevoJugador.trim(),
        equipo_id: equipoSeleccionado,
        goles: 0
      }])

    if (error) {
      console.error('Error al agregar goleador:', error)
      showToast('Error al agregar goleador: ' + error.message, 'error')
      return
    }

    showToast(`Goleador "${nuevoJugador.trim()}" agregado a ${equipoNombre}`, 'success')
    setNuevoJugador('')
    setEquipoSeleccionado('')
    fetchGoleadores(equipos)
  }

  const eliminarGoleador = async (id: string, nombre: string) => {
    showConfirm(
      'Eliminar Goleador',
      `¿Estás seguro de eliminar a "${nombre}" de la tabla de goleadores?`,
      async () => {
        const { error } = await supabase.from('goleo').delete().eq('id', id)

        if (error) {
          console.error('Error al eliminar goleador:', error)
          showToast('Error al eliminar: ' + error.message, 'error')
          return
        }

        showToast(`Goleador "${nombre}" eliminado`, 'success')
        fetchGoleadores(equipos)
        closeConfirm()
      },
      'danger'
    )
  }

  const guardarDescripcion = async () => {
    const { error } = await supabase
      .from('torneos')
      .update({ descripcion })
      .eq('id', torneoId)

    if (error) {
      console.error('Error al guardar descripción:', error)
      showToast('Error al guardar: ' + error.message, 'error')
      return
    }

    showToast('Descripción guardada correctamente', 'success')
  }

const guardarNombre = async () => {
  if (!nombreTorneo.trim()) {
    showToast('El nombre no puede estar vacío', 'warning')
    return
  }

  // Guardar en Supabase
  const { data, error } = await supabase
    .from('torneos')
    .update({ nombre: nombreTorneo.trim() })
    .eq('id', torneoId)
    .select() // ← Esto devuelve los datos actualizados

  console.log('📤 Respuesta de Supabase:', { data, error })

  if (error) {
    console.error('❌ Error al guardar:', error)
    showToast('Error al guardar: ' + error.message, 'error')
    return
  }

  if (!data || data.length === 0) {
    console.error('❌ No se actualizó ningún registro. Posible problema de RLS o ID incorrecto.')
    showToast('Error: No se pudo guardar. Verifica los permisos.', 'error')
    return
  }

  console.log('✅ Nombre actualizado en BD:', data)
  
  // Actualizar estado local
  setTorneo((prev: any) => ({ ...prev, nombre: nombreTorneo.trim() }))
  setEditandoNombre(false)
  showToast('Nombre actualizado correctamente', 'success')
}

  const renderEditableCell = (
    type: 'equipo' | 'goleador',
    id: string,
    field: string,
    value: number,
    onUpdate: (val: number) => void
  ) => {
    const isEditing = editingCell?.type === type && editingCell?.id === id && editingCell?.field === field

    if (!isOwner) return <span className="font-mono">{value}</span>

    if (isEditing) {
      return (
        <input
          type="number"
          defaultValue={value}
          autoFocus
          onBlur={(e) => {
            const newVal = parseInt(e.target.value) || 0
            onUpdate(newVal)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const newVal = parseInt((e.target as HTMLInputElement).value) || 0
              onUpdate(newVal)
            }
            if (e.key === 'Escape') setEditingCell(null)
          }}
          className="w-16 bg-black border border-[#10b981] rounded px-2 py-1 text-center text-white text-sm"
        />
      )
    }

    return (
      <span
        onClick={() => setEditingCell({ type, id, field })}
        className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors inline-block"
        title="Clic para editar"
      >
        {value}
      </span>
    )
  }

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-[#10b981] text-black border-[#059669]'
      case 'error':
        return 'bg-red-500 text-white border-red-700'
      case 'warning':
        return 'bg-yellow-500 text-black border-yellow-700'
      case 'info':
        return 'bg-blue-500 text-white border-blue-700'
      default:
        return 'bg-gray-700 text-white border-gray-900'
    }
  }


  //Funcion desc JPG
const descargarComoJPG = async () => {
  const element =
    document.getElementById('torneo-content') ||
    document.getElementById('torneo-gestion-content')

  if (!element) return

  try {
    const dataUrl = await htmlToImage.toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#050f0c',
      cacheBust: true
    })

    // 🔥 convertir a blob
    const blob = await (await fetch(dataUrl)).blob()

    const file = new File([blob], `torneo-${torneo?.nombre || 'ARES'}.jpg`, {
      type: 'image/jpeg'
    })

    // 📱 compartir (móvil)
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: torneo?.nombre || 'Torneo ARES'
        })
        return
      } catch (e) {}
    }

    // 💾 descarga normal
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `torneo-${torneo?.nombre || 'ARES'}.jpg`
    link.click()

  } catch (error) {
    console.error('Error al generar imagen:', error)
  }
}
//
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050f0c] text-white">
        <p className="text-[#10b981] animate-pulse uppercase tracking-widest text-sm">Cargando torneo...</p>
      </div>
    )
  }

  if (!torneo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050f0c] text-white">
        <p className="text-red-400 uppercase tracking-widest text-sm">Torneo no encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050f0c] text-white p-6 md:p-12">
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a1612] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className={`text-2xl font-black uppercase italic mb-4 ${
              confirmModal.type === 'danger' ? 'text-red-500' : 
              confirmModal.type === 'warning' ? 'text-yellow-500' : 'text-[#10b981]'
            }`}>
              {confirmModal.title}
            </h3>
            <p className="text-white/70 text-sm mb-8 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-4">
              <button
                onClick={closeConfirm}
                className="flex-1 bg-white/5 border border-white/10 text-white font-black py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm()
                }}
                className={`flex-1 font-black py-3 rounded-xl uppercase text-xs tracking-widest transition ${
                  confirmModal.type === 'danger' 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : confirmModal.type === 'warning'
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                    : 'bg-[#10b981] text-black hover:bg-[#0d9668]'
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-5 right-5 z-40 flex flex-col gap-3 max-w-md w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`${getToastStyles(toast.type)} border-l-8 rounded-xl shadow-2xl p-4 flex items-center justify-between animate-slideIn`}
          >
            <span className="font-black uppercase text-xs tracking-widest">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-current opacity-70 hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <button
            onClick={() => router.back()}
            className="text-[#10b981] font-black uppercase text-xs tracking-widest hover:opacity-70 transition"
          >
            ← Volver
          </button>

          <div className="flex items-center gap-4">

            {editandoNombre ? (
  <div className="flex items-center gap-2">
    <input
      type="text"
      value={nombreTorneo}
      onChange={(e) => setNombreTorneo(e.target.value)}
      className="bg-black/40 border border-[#10b981] rounded-xl px-4 py-2 text-white font-black italic uppercase text-2xl md:text-4xl tracking-tighter focus:outline-none focus:ring-2 focus:ring-[#10b981]/40 w-full max-w-md"
      autoFocus
      onKeyDown={(e) => {
        if (e.key === 'Enter') guardarNombre()
        if (e.key === 'Escape') {
          setNombreTorneo(torneo.nombre)
          setEditandoNombre(false)
        }
      }}
    />

    <button
      onClick={guardarNombre}
      className="bg-[#10b981] text-black font-black text-[10px] uppercase px-3 py-2 rounded-lg hover:scale-105 transition whitespace-nowrap"
    >
      Guardar
    </button>

    <button
      onClick={() => {
        setNombreTorneo(torneo.nombre)
        setEditandoNombre(false)
      }}
      className="bg-white/10 text-white font-black text-[10px] uppercase px-3 py-2 rounded-lg hover:bg-white/20 transition whitespace-nowrap"
    >
      ✕
    </button>
  </div>
) : (
  <div className="flex items-center gap-2 md:gap-4">
    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
      {torneo.nombre}
    </h1>
    {isOwner && (
      <button
        onClick={() => setEditandoNombre(true)}
        className="text-white/30 hover:text-[#10b981] transition"
        title="Editar nombre"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    )}
  </div>
)}

            <button
              onClick={descargarComoJPG}
              className="bg-white/10 border border-white/20 text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl tracking-widest hover:bg-[#10b981] hover:text-black transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>JPG</span>
            </button>
          </div>

          <div className="w-20"></div>
        </div>

        <div id="torneo-gestion-content">
          <div className="bg-white/5 p-6 rounded-2xl mb-10 border border-white/10">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
              Descripción del torneo
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={!isOwner}
              className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-sm focus:border-[#10b981] outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              rows={3}
              placeholder={isOwner ? "Describe tu torneo (Precios, modalidad, etc.)" : "Sin descripción"}
            />

            {isOwner && (
              <button
                onClick={guardarDescripcion}
                className="mt-4 bg-[#10b981] text-black font-black px-6 py-3 rounded-xl uppercase text-[10px] tracking-widest hover:scale-105 transition"
              >
                Guardar descripción
              </button>
            )}
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setTab('equipos')}
              className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition ${
                tab === 'equipos'
                  ? 'bg-[#10b981] text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              Tabla General
            </button>

            <button
              onClick={() => setTab('goleo')}
              className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition ${
                tab === 'goleo'
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              Goleadores
            </button>
          </div>

          {tab === 'equipos' && (
            <div className="space-y-8">
              {isOwner && (
                <div className="bg-gradient-to-r from-white/5 to-transparent p-[1px] rounded-2xl">
                  <div className="bg-[#0a1612] p-6 rounded-2xl flex flex-col md:flex-row gap-4">
                    <input
                      value={nuevoEquipo}
                      onChange={(e) => setNuevoEquipo(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 font-bold uppercase text-sm"
                      placeholder="Nombre del nuevo equipo"
                    />
                    <button
                      onClick={agregarEquipo}
                      className="bg-white text-black font-black px-8 py-4 rounded-xl uppercase text-[10px] tracking-widest hover:bg-[#10b981] transition"
                    >
                      Añadir Equipo
                    </button>
                  </div>
                </div>
              )}

              {equipos.length === 0 ? (
                <div className="bg-white/5 border border-dashed border-white/10 p-20 rounded-3xl text-center">
                  <p className="text-white/20 font-black uppercase text-xs tracking-widest">
                    No hay equipos registrados
                  </p>
                </div>
              ) : (
                <div className="bg-white/5 rounded-3xl border border-white/10 overflow-x-auto">
                  <table className="w-full text-left min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="p-4 text-[10px] font-black text-gray-500">Pos</th>
                        <th className="p-4 text-[10px] font-black text-gray-500">Equipo</th>
                        <th className="p-4 text-[10px] font-black text-gray-500">PJ</th>
                        <th className="p-4 text-[10px] font-black text-gray-500">G</th>
                        <th className="p-4 text-[10px] font-black text-gray-500">E</th>
                        <th className="p-4 text-[10px] font-black text-gray-500">P</th>
                        <th className="p-4 text-[10px] font-black text-gray-500">GF</th>
                        <th className="p-4 text-[10px] font-black text-gray-500">GC</th>
                        <th className="p-4 text-[10px] font-black text-gray-500">DG</th>
                        <th className="p-4 text-[10px] font-black text-gray-500">Pts</th>
                        {isOwner && <th className="p-4 text-[10px] font-black text-gray-500"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {equipos.map((eq, i) => (
                        <tr key={eq.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-black text-[#10b981]">{i + 1}</td>
                          <td className="p-4 font-black uppercase">{eq.nombre}</td>
                          <td className="p-4">{renderEditableCell('equipo', eq.id, 'partidos_jugados', eq.partidos_jugados || 0, (val) => updateStat('equipos', eq.id, 'partidos_jugados', val))}</td>
                          <td className="p-4">{renderEditableCell('equipo', eq.id, 'ganados', eq.ganados || 0, (val) => updateStat('equipos', eq.id, 'ganados', val))}</td>
                          <td className="p-4">{renderEditableCell('equipo', eq.id, 'empatados', eq.empatados || 0, (val) => updateStat('equipos', eq.id, 'empatados', val))}</td>
                          <td className="p-4">{renderEditableCell('equipo', eq.id, 'perdidos', eq.perdidos || 0, (val) => updateStat('equipos', eq.id, 'perdidos', val))}</td>
                          <td className="p-4">{renderEditableCell('equipo', eq.id, 'goles_favor', eq.goles_favor || 0, (val) => updateStat('equipos', eq.id, 'goles_favor', val))}</td>
                          <td className="p-4">{renderEditableCell('equipo', eq.id, 'goles_contra', eq.goles_contra || 0, (val) => updateStat('equipos', eq.id, 'goles_contra', val))}</td>
                          <td className="p-4 font-mono">{eq.diferencia || 0}</td>
                          <td className="p-4 font-black">{renderEditableCell('equipo', eq.id, 'puntos', eq.puntos || 0, (val) => updateStat('equipos', eq.id, 'puntos', val))}</td>
                          {isOwner && (
                            <td className="p-4">
                              <button onClick={() => eliminarEquipo(eq.id, eq.nombre)} className="text-red-400 hover:text-red-300 text-lg">🗑️</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'goleo' && (
            <div className="space-y-8">
              {isOwner && (
                <div className="bg-gradient-to-r from-white/5 to-transparent p-[1px] rounded-2xl">
                  <div className="bg-[#0a1612] p-5 rounded-2xl flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                      <input
                        value={nuevoJugador}
                        onChange={(e) => setNuevoJugador(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-bold uppercase text-xs text-white placeholder:text-white/30 focus:border-[#10b981] outline-none transition-all"
                        placeholder="Nombre del jugador"
                      />
                    </div>
                    
                    <div className="relative flex-1" ref={selectRef}>
                      <button
                        type="button"
                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                        className="w-full bg-[#10b981] text-black font-black uppercase text-xs rounded-xl px-4 py-3 text-left flex items-center justify-between border-2 border-[#10b981] focus:outline-none focus:ring-2 focus:ring-white/30 transition-all hover:bg-[#0d9668]"
                      >
                        <span className="truncate">
                          {equipoSeleccionado 
                            ? equipos.find(e => e.id === equipoSeleccionado)?.nombre 
                            : 'Seleccionar equipo'}
                        </span>
                        <svg className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isSelectOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-[#10b981] border-2 border-[#10b981] rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                          <div
                            onClick={() => {
                              setEquipoSeleccionado('')
                              setIsSelectOpen(false)
                            }}
                            className="px-4 py-2.5 text-black font-black uppercase text-xs hover:bg-[#0d9668] cursor-pointer transition-colors border-b border-black/20"
                          >
                            Ninguno
                          </div>
                          {equipos.map(eq => (
                            <div
                              key={eq.id}
                              onClick={() => {
                                setEquipoSeleccionado(eq.id)
                                setIsSelectOpen(false)
                              }}
                              className="px-4 py-2.5 text-black font-black uppercase text-xs hover:bg-[#0d9668] cursor-pointer transition-colors border-b border-black/20 last:border-b-0"
                            >
                              {eq.nombre}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={agregarGoleador}
                      className="bg-white text-black font-black px-5 py-3 rounded-xl uppercase text-[10px] tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-600/30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Añadir</span>
                    </button>
                  </div>
                </div>
              )}


             {goleadores.length === 0 ? (
  <div className="bg-white/5 border border-dashed border-white/10 p-20 rounded-3xl text-center">
    <p className="text-white/20 font-black uppercase text-xs tracking-widest">No hay goleadores registrados</p>
  </div>
) : (
  <div className="bg-white/5 rounded-3xl border border-white/10 overflow-x-auto">
    <table className="w-full text-left min-w-[500px]">
      <thead>
        <tr className="border-b border-white/10">
          <th className="p-6 text-[10px] font-black text-gray-500">Pos</th>
          <th className="p-6 text-[10px] font-black text-gray-500">Jugador</th>
          <th className="p-6 text-[10px] font-black text-gray-500">Equipo</th>
          <th className="p-6 text-[10px] font-black text-gray-500 text-center">Goles</th>
          {isOwner && <th className="p-6 text-[10px] font-black text-gray-500 text-right"></th>}
        </tr>
      </thead>
      <tbody>
        {goleadores.map((g, i) => (
          <tr key={g.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="p-6 font-black text-[#10b981]">{i + 1}</td>
            <td className="p-6 font-black uppercase whitespace-nowrap">{g.nombre_jugador}</td>
            <td className="p-6 text-gray-400 whitespace-nowrap">{g.equipos?.nombre}</td>
            <td className="p-6 text-center">
              {renderEditableCell('goleador', g.id, 'goles', g.goles, (val) => updateStat('goleo', g.id, 'goles', val))}
            </td>
            {isOwner && (
              <td className="p-6 text-right">
                <button onClick={() => eliminarGoleador(g.id, g.nombre_jugador)} className="text-red-400 hover:text-red-300 text-lg">🗑️</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}